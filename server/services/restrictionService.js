const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const jsonStore = require('../utils/jsonStore');

const RESTRICTIONS_FILE = 'restrictions';
const DETECTIONS_FILE = 'detections';

async function isUserRestricted(userId) {
  const restrictions = jsonStore.readJSON(RESTRICTIONS_FILE, []);
  const now = Date.now();
  return restrictions.some(
    (r) => r.userId === userId && r.active && new Date(r.endTime).getTime() > now
  );
}

async function getActiveRestriction(userId) {
  const restrictions = jsonStore.readJSON(RESTRICTIONS_FILE, []);
  const now = Date.now();
  return (
    restrictions.find(
      (r) => r.userId === userId && r.active && new Date(r.endTime).getTime() > now
    ) || null
  );
}

async function countRecentHighRiskDetections(userId) {
  const detections = jsonStore.readJSON(DETECTIONS_FILE, []);
  const windowStart = Date.now() - config.RESTRICTIONS.LOOKBACK_WINDOW_MS;
  return detections.filter(
    (d) =>
      d.userId === userId &&
      d.riskLevel === 'HIGH' &&
      new Date(d.createdAt).getTime() >= windowStart
  ).length;
}

/**
 * Creates a restriction record. Used both by automatic detection and by
 * manual admin action.
 */
async function createRestriction({
  userId,
  restrictionType = 'TEMPORARY_POSTING_BAN',
  reason,
  durationMs = config.RESTRICTIONS.DEFAULT_DURATION_MS,
  createdBy = 'SYSTEM',
  relatedDetectionId = null
}) {
  const now = new Date();
  const restriction = {
    id: uuidv4(),
    userId,
    restrictionType,
    reason,
    startTime: now.toISOString(),
    endTime: new Date(now.getTime() + durationMs).toISOString(),
    active: true,
    createdBy,
    relatedDetectionId,
    createdAt: now.toISOString()
  };

  await jsonStore.update(RESTRICTIONS_FILE, [], (restrictions) => {
    restrictions.push(restriction);
  });

  return restriction;
}

async function removeRestriction(restrictionId, adminId) {
  return jsonStore.update(RESTRICTIONS_FILE, [], (restrictions) => {
    const restriction = restrictions.find((r) => r.id === restrictionId);
    if (!restriction) {
      const err = new Error('Restriction not found');
      err.status = 404;
      throw err;
    }
    restriction.active = false;
    restriction.removedBy = adminId;
    restriction.removedAt = new Date().toISOString();
    return restriction;
  });
}

async function removeActiveRestrictionsForUser(userId, adminId) {
  return jsonStore.update(RESTRICTIONS_FILE, [], (restrictions) => {
    const now = Date.now();
    const updated = [];
    restrictions.forEach((r) => {
      if (r.userId === userId && r.active && new Date(r.endTime).getTime() > now) {
        r.active = false;
        r.removedBy = adminId;
        r.removedAt = new Date().toISOString();
        updated.push(r);
      }
    });
    return updated;
  });
}

/**
 * Called automatically after a HIGH risk detection. If the user has
 * accumulated enough recent HIGH risk detections, apply a temporary
 * restriction. Never a permanent ban/delete — always temporary.
 */
async function evaluateAutoRestriction(userId, detectionId) {
  const highRiskCount = await countRecentHighRiskDetections(userId);
  const alreadyRestricted = await isUserRestricted(userId);

  if (!alreadyRestricted && highRiskCount >= config.RESTRICTIONS.HIGH_RISK_COUNT_TRIGGER) {
    return createRestriction({
      userId,
      restrictionType: 'TEMPORARY_POSTING_BAN',
      reason: `Automatic restriction: ${highRiskCount} high-risk detections within 24 hours`,
      createdBy: 'SYSTEM',
      relatedDetectionId: detectionId
    });
  }
  return null;
}

async function getAllRestrictions() {
  return jsonStore.readJSON(RESTRICTIONS_FILE, []);
}

module.exports = {
  isUserRestricted,
  getActiveRestriction,
  countRecentHighRiskDetections,
  createRestriction,
  removeRestriction,
  removeActiveRestrictionsForUser,
  evaluateAutoRestriction,
  getAllRestrictions,
  RESTRICTIONS_FILE
};
