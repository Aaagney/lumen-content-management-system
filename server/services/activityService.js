const jsonStore = require('../utils/jsonStore');
const restrictionService = require('./restrictionService');

const DETECTIONS_FILE = 'detections';
const CONTENT_LOG_FILE = 'contentLog';

/**
 * Build a full activity/history view for a single user — used by the
 * admin "View User Activity" panel and by the detection detail modal.
 */
async function getUserActivity(userId) {
  const detections = jsonStore
    .readJSON(DETECTIONS_FILE, [])
    .filter((d) => d.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const contentLog = jsonStore
    .readJSON(CONTENT_LOG_FILE, [])
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const restrictions = (await restrictionService.getAllRestrictions())
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const activeRestriction = await restrictionService.getActiveRestriction(userId);

  const summary = {
    totalContentSubmitted: contentLog.length,
    totalDetections: detections.length,
    lowRiskCount: detections.filter((d) => d.riskLevel === 'LOW').length,
    mediumRiskCount: detections.filter((d) => d.riskLevel === 'MEDIUM').length,
    highRiskCount: detections.filter((d) => d.riskLevel === 'HIGH').length,
    blockedCount: detections.filter((d) => d.action === 'BLOCK').length,
    isCurrentlyRestricted: !!activeRestriction
  };

  return {
    userId,
    summary,
    activeRestriction,
    recentDetections: detections.slice(0, 20),
    recentContent: contentLog.slice(0, 20),
    restrictionHistory: restrictions
  };
}

module.exports = { getUserActivity };
