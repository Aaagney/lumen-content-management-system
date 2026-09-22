const jsonStore = require('../utils/jsonStore');
const restrictionService = require('./restrictionService');

const DETECTIONS_FILE = 'detections';

async function getStats() {
  const detections = jsonStore.readJSON(DETECTIONS_FILE, []);
  const restrictions = await restrictionService.getAllRestrictions();
  const now = Date.now();

  const activeRestrictedUsers = new Set(
    restrictions
      .filter((r) => r.active && new Date(r.endTime).getTime() > now)
      .map((r) => r.userId)
  ).size;

  return {
    totalDetections: detections.length,
    spamPosts: detections.filter((d) => d.contentType === 'post' && d.riskLevel !== 'LOW').length,
    spamComments: detections.filter((d) => d.contentType === 'comment' && d.riskLevel !== 'LOW').length,
    suspiciousLinks: detections.filter((d) => d.signals && d.signals.suspiciousLinks).length,
    restrictedUsers: activeRestrictedUsers,
    breakdown: {
      low: detections.filter((d) => d.riskLevel === 'LOW').length,
      medium: detections.filter((d) => d.riskLevel === 'MEDIUM').length,
      high: detections.filter((d) => d.riskLevel === 'HIGH').length
    },
    actionBreakdown: {
      allow: detections.filter((d) => d.action === 'ALLOW').length,
      flag: detections.filter((d) => d.action === 'FLAG').length,
      block: detections.filter((d) => d.action === 'BLOCK').length
    }
  };
}

module.exports = { getStats };
