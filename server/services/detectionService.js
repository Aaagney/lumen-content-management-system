const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const jsonStore = require('../utils/jsonStore');
const { jaccardSimilarity, isExactNormalizedMatch, normalizeText } = require('../utils/textSimilarity');
const { analyzeUrls } = require('../utils/urlAnalysis');
const restrictionService = require('./restrictionService');
const auditService = require('./auditService');

const DETECTIONS_FILE = 'detections';
const CONTENT_LOG_FILE = 'contentLog'; // history of all analyzed content, for duplicate/activity checks

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

function riskLevelFromScore(score) {
  const { RISK_LEVELS } = config;
  if (score >= RISK_LEVELS.HIGH.min) return { level: 'HIGH', action: RISK_LEVELS.HIGH.action };
  if (score >= RISK_LEVELS.MEDIUM.min) return { level: 'MEDIUM', action: RISK_LEVELS.MEDIUM.action };
  return { level: 'LOW', action: RISK_LEVELS.LOW.action };
}

/**
 * Look at the user's recent content history to find:
 * - duplicate/near-duplicate content
 * - excessive posting activity
 * - repeated identical posting
 */
function analyzeAgainstHistory(userId, text, contentType, now, history) {
  const windowStart = now - config.SIMILARITY.LOOKBACK_WINDOW_MS;
  const recentUserItems = history
    .filter((item) => item.userId === userId && item.timestamp >= windowStart)
    .slice(-config.SIMILARITY.MAX_RECENT_ITEMS_TO_COMPARE);

  // Duplicate detection
  let bestMatch = null;
  for (const item of recentUserItems) {
    if (isExactNormalizedMatch(item.text, text)) {
      bestMatch = { contentId: item.contentId, similarityScore: 1, reason: 'Exact duplicate content' };
      break;
    }
    const similarity = jaccardSimilarity(item.text, text);
    if (similarity >= config.SIMILARITY.DUPLICATE_THRESHOLD) {
      if (!bestMatch || similarity > bestMatch.similarityScore) {
        bestMatch = {
          contentId: item.contentId,
          similarityScore: Number(similarity.toFixed(2)),
          reason: 'Highly similar to previous content'
        };
      }
    }
  }

  // Excessive activity: too many items in the short activity window
  const activityWindowStart = now - config.ACTIVITY.WINDOW_MS;
  const itemsInActivityWindow = history.filter(
    (item) => item.userId === userId && item.timestamp >= activityWindowStart
  );
  const excessiveActivity = itemsInActivityWindow.length >= config.ACTIVITY.MAX_ITEMS_PER_WINDOW;

  // Repeated posting: same normalized text posted more than once recently
  const repeatWindowStart = now - config.ACTIVITY.REPEAT_WINDOW_MS;
  const normalized = normalizeText(text);
  const repeatCount = history.filter(
    (item) =>
      item.userId === userId &&
      item.timestamp >= repeatWindowStart &&
      normalizeText(item.text) === normalized &&
      normalized.length > 0
  ).length;
  const repeatedPosting = repeatCount >= 1; // one prior identical post = repetition

  return {
    duplicateMatch: bestMatch,
    excessiveActivity,
    recentActivityCount: itemsInActivityWindow.length,
    repeatedPosting,
    repeatCount
  };
}

function detectPromotionalContent(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return config.PROMOTIONAL_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

function analyzeRepeatedDomains(userId, urlAnalysis, now, history) {
  if (urlAnalysis.domains.length === 0) return { repeatedDomain: false, domains: [] };
  const windowStart = now - config.SIMILARITY.LOOKBACK_WINDOW_MS;
  const recentUserItems = history.filter(
    (item) => item.userId === userId && item.timestamp >= windowStart
  );

  const repeatedDomains = urlAnalysis.domains.filter((domain) => {
    const count = recentUserItems.filter((item) =>
      (item.domains || []).includes(domain)
    ).length;
    return count >= config.LINKS.REPEATED_DOMAIN_THRESHOLD - 1; // -1 since current isn't logged yet
  });

  return { repeatedDomain: repeatedDomains.length > 0, domains: repeatedDomains };
}

/**
 * Main entry point: analyze a piece of content (post or comment) and
 * return a full risk assessment. Persists the detection + content log entry.
 */
async function analyzeContent({ userId, userName, contentId, contentType, text }) {
  if (!userId || !text) {
    const err = new Error('userId and text are required for analysis');
    err.status = 400;
    throw err;
  }

  const now = Date.now();
  const history = jsonStore.readJSON(CONTENT_LOG_FILE, []);
  const urlAnalysis = analyzeUrls(text);
  const historyAnalysis = analyzeAgainstHistory(userId, text, contentType, now, history);
  const isPromotional = detectPromotionalContent(text);
  const domainAnalysis = analyzeRepeatedDomains(userId, urlAnalysis, now, history);
  const priorViolations = await restrictionService.countRecentHighRiskDetections(userId);
  const isRestricted = await restrictionService.isUserRestricted(userId);

  // ---- Build signals + score ----
  const signals = {
    duplicateContent: !!historyAnalysis.duplicateMatch,
    excessiveActivity: historyAnalysis.excessiveActivity,
    repeatedPosting: historyAnalysis.repeatedPosting,
    suspiciousLinks: urlAnalysis.hasShortened || urlAnalysis.hasIpBased || urlAnalysis.hasObfuscated,
    excessiveLinks: urlAnalysis.excessiveLinks,
    promotionalContent: isPromotional,
    repeatedDomain: domainAnalysis.repeatedDomain,
    previousViolations: priorViolations > 0
  };

  const reasons = [];
  let score = 0;

  if (signals.duplicateContent) {
    score += config.WEIGHTS.DUPLICATE_CONTENT;
    reasons.push(
      historyAnalysis.duplicateMatch.similarityScore === 1
        ? 'Exact duplicate of previous content'
        : `Highly similar to previous content (similarity ${Math.round(historyAnalysis.duplicateMatch.similarityScore * 100)}%)`
    );
  }
  if (signals.excessiveActivity) {
    score += config.WEIGHTS.EXCESSIVE_ACTIVITY;
    reasons.push('Excessive posting/commenting activity in a short period');
  }
  if (signals.repeatedPosting) {
    score += config.WEIGHTS.REPEATED_POSTING;
    reasons.push('Same content repeated recently');
  }
  if (signals.suspiciousLinks) {
    score += config.WEIGHTS.SUSPICIOUS_LINK;
    reasons.push('Contains suspicious links (shortened, IP-based, or obfuscated)');
  }
  if (signals.excessiveLinks) {
    score += config.WEIGHTS.MULTIPLE_SUSPICIOUS_LINKS;
    reasons.push(`Contains an unusually high number of links (${urlAnalysis.totalLinks})`);
  }
  if (signals.promotionalContent) {
    score += config.WEIGHTS.PROMOTIONAL_CONTENT;
    reasons.push('Contains promotional/spam-like language');
  }
  if (signals.repeatedDomain) {
    score += config.WEIGHTS.REPEATED_DOMAIN;
    reasons.push(`Repeatedly links to the same domain(s): ${domainAnalysis.domains.join(', ')}`);
  }
  if (signals.previousViolations) {
    score += config.WEIGHTS.PREVIOUS_VIOLATIONS;
    reasons.push('User has previous high-risk violations');
  }

  score = clampScore(score);
  const { level, action } = riskLevelFromScore(score);

  // Never block on a single weak signal: if only one non-duplicate,
  // non-link signal fired and score landed in HIGH borderline territory
  // by itself, this is naturally avoided since single weights (max 30)
  // cannot reach 60 alone — documented safeguard, no extra code needed.

  const detection = {
    id: uuidv4(),
    userId,
    userName: userName || userId,
    contentId: contentId || uuidv4(),
    contentType: contentType || 'post', // 'post' | 'comment'
    text,
    riskScore: score,
    riskLevel: level,
    action, // ALLOW | FLAG | BLOCK
    status: action === 'ALLOW' ? 'ALLOWED' : action === 'FLAG' ? 'PENDING_REVIEW' : 'BLOCKED',
    reasons,
    signals,
    matchedContentId: historyAnalysis.duplicateMatch ? historyAnalysis.duplicateMatch.contentId : null,
    similarityScore: historyAnalysis.duplicateMatch ? historyAnalysis.duplicateMatch.similarityScore : null,
    suspiciousUrls: urlAnalysis.details.filter((d) => d.isShortened || d.isIpBased || d.isObfuscated),
    totalLinks: urlAnalysis.totalLinks,
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString()
  };

  // Persist detection record
  await jsonStore.update(DETECTIONS_FILE, [], (detections) => {
    detections.push(detection);
  });

  // Log this content for future history-based checks
  await jsonStore.update(CONTENT_LOG_FILE, [], (log) => {
    log.push({
      contentId: detection.contentId,
      userId,
      contentType: detection.contentType,
      text,
      domains: urlAnalysis.domains,
      timestamp: now
    });
  });

  // Audit trail entry for the automatic system action
  await auditService.recordAudit({
    detectionId: detection.id,
    userId,
    adminId: 'SYSTEM',
    action: `AUTO_${action}`,
    reason: reasons.join('; ') || 'No risk signals detected',
    previousStatus: null,
    newStatus: detection.status
  });

  // Repeated high-risk behavior -> automatic temporary restriction
  if (level === 'HIGH') {
    await restrictionService.evaluateAutoRestriction(userId, detection.id);
  }

  return { detection, isRestricted };
}

module.exports = {
  analyzeContent,
  riskLevelFromScore,
  clampScore,
  DETECTIONS_FILE,
  CONTENT_LOG_FILE
};
