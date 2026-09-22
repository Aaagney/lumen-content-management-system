/**
 * Central configuration for the Spam & Abuse Detection module.
 * Keeping thresholds/weights here means nothing is hard-coded
 * deep inside the detection logic — tune the whole module from one place.
 */

module.exports = {
  PORT: process.env.PORT || 5050,

  // ---- Risk score weights (points added per detected signal) ----
  WEIGHTS: {
    DUPLICATE_CONTENT: 30,
    EXCESSIVE_ACTIVITY: 20,
    SUSPICIOUS_LINK: 25,
    REPEATED_POSTING: 20,
    PREVIOUS_VIOLATIONS: 15,
    MULTIPLE_SUSPICIOUS_LINKS: 15,
    PROMOTIONAL_CONTENT: 15,
    REPEATED_DOMAIN: 10
  },

  // ---- Risk level bands ----
  RISK_LEVELS: {
    LOW: { min: 0, max: 29, action: 'ALLOW' },
    MEDIUM: { min: 30, max: 59, action: 'FLAG' },
    HIGH: { min: 60, max: 100, action: 'BLOCK' }
  },

  // ---- Duplicate / similarity detection ----
  SIMILARITY: {
    // Jaccard similarity (0-1) above which two pieces of content are
    // considered near-duplicates.
    DUPLICATE_THRESHOLD: 0.8,
    // How far back (in ms) to look for duplicate matches.
    LOOKBACK_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
    // How many of the user's most recent items to compare against.
    MAX_RECENT_ITEMS_TO_COMPARE: 25
  },

  // ---- Activity / rate limiting thresholds ----
  ACTIVITY: {
    // Posting more than this many items within WINDOW_MS is "excessive".
    MAX_ITEMS_PER_WINDOW: 5,
    WINDOW_MS: 10 * 60 * 1000, // 10 minutes
    // Repeated identical (or near-identical) content within this window
    // counts as "repeated posting".
    REPEAT_WINDOW_MS: 60 * 60 * 1000 // 1 hour
  },

  // ---- Link analysis ----
  LINKS: {
    MAX_LINKS_BEFORE_FLAG: 3,
    SHORTENER_DOMAINS: [
      'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd',
      'buff.ly', 'rebrand.ly', 'shorte.st', 'cutt.ly', 'tiny.cc'
    ],
    // Domains posted this many times by the same user recently -> flagged.
    REPEATED_DOMAIN_THRESHOLD: 3
  },

  // ---- Restrictions ----
  RESTRICTIONS: {
    // How many HIGH risk detections in the lookback window before an
    // automatic temporary restriction is applied.
    HIGH_RISK_COUNT_TRIGGER: 3,
    LOOKBACK_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
    DEFAULT_DURATION_MS: 24 * 60 * 60 * 1000 // 24 hour restriction
  },

  // ---- Simple promotional keyword list (deterministic, no AI) ----
  PROMOTIONAL_KEYWORDS: [
    'buy now', 'click here', 'limited offer', 'discount code', 'free money',
    'act now', 'subscribe now', 'earn money fast', 'work from home',
    'guaranteed profit', 'crypto giveaway', '投资', 'winner', 'you have won',
    'cash prize', 'no cost', 'risk free', 'best price guaranteed'
  ]
};
