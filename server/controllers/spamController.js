const jsonStore = require('../utils/jsonStore');
const detectionService = require('../services/detectionService');
const statsService = require('../services/statsService');
const activityService = require('../services/activityService');
const restrictionService = require('../services/restrictionService');
const auditService = require('../services/auditService');

const DETECTIONS_FILE = 'detections';

// POST /api/spam/analyze
// This is the real integration point: call this before a post/comment is
// actually saved by the content system. It checks restriction status,
// runs full detection, and tells the caller whether to allow/flag/block.
async function analyze(req, res, next) {
  try {
    const { userId, userName, contentId, contentType, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ error: 'userId and text are required' });
    }

    const alreadyRestricted = await restrictionService.isUserRestricted(userId);
    if (alreadyRestricted) {
      const restriction = await restrictionService.getActiveRestriction(userId);
      return res.status(403).json({
        error: 'User is currently restricted from posting content',
        restriction
      });
    }

    const { detection } = await detectionService.analyzeContent({
      userId,
      userName,
      contentId,
      contentType,
      text
    });

    return res.status(201).json(detection);
  } catch (err) {
    next(err);
  }
}

// GET /api/spam/detections
function listDetections(req, res, next) {
  try {
    const { search, riskLevel, contentType, status, from, to, page = 1, pageSize = 10 } = req.query;
    let detections = jsonStore.readJSON(DETECTIONS_FILE, []);

    if (search) {
      const q = search.toLowerCase();
      detections = detections.filter(
        (d) =>
          (d.userName && d.userName.toLowerCase().includes(q)) ||
          (d.userId && d.userId.toLowerCase().includes(q)) ||
          (d.text && d.text.toLowerCase().includes(q))
      );
    }
    if (riskLevel) {
      detections = detections.filter((d) => d.riskLevel === riskLevel.toUpperCase());
    }
    if (contentType) {
      detections = detections.filter((d) => d.contentType === contentType);
    }
    if (status) {
      detections = detections.filter((d) => d.status === status.toUpperCase());
    }
    if (from) {
      const fromTime = new Date(from).getTime();
      detections = detections.filter((d) => new Date(d.createdAt).getTime() >= fromTime);
    }
    if (to) {
      const toTime = new Date(to).getTime();
      detections = detections.filter((d) => new Date(d.createdAt).getTime() <= toTime);
    }

    detections = detections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = detections.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.max(1, parseInt(pageSize, 10) || 10);
    const start = (pageNum - 1) * size;
    const paginated = detections.slice(start, start + size);

    res.json({
      data: paginated,
      pagination: { page: pageNum, pageSize: size, total, totalPages: Math.ceil(total / size) }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/spam/stats
async function stats(req, res, next) {
  try {
    const data = await statsService.getStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// GET /api/spam/detections/:id
function getDetection(req, res, next) {
  try {
    const detections = jsonStore.readJSON(DETECTIONS_FILE, []);
    const detection = detections.find((d) => d.id === req.params.id);
    if (!detection) return res.status(404).json({ error: 'Detection not found' });

    const relatedAudit = auditService.getAuditLog({ detectionId: detection.id });
    res.json({ ...detection, auditHistory: relatedAudit });
  } catch (err) {
    next(err);
  }
}

// POST /api/spam/detections/:id/action
// Admin actions: ALLOW | BLOCK | WARN | RESTRICT
async function takeAction(req, res, next) {
  try {
    const { action, adminId, reason, restrictionDurationMs } = req.body;
    const validActions = ['ALLOW', 'BLOCK', 'WARN', 'RESTRICT'];

    if (!action || !validActions.includes(action.toUpperCase())) {
      return res.status(400).json({ error: `action must be one of ${validActions.join(', ')}` });
    }

    const result = await jsonStore.update(DETECTIONS_FILE, [], (detections) => {
      const detection = detections.find((d) => d.id === req.params.id);
      if (!detection) {
        const err = new Error('Detection not found');
        err.status = 404;
        throw err;
      }
      const previousStatus = detection.status;
      const statusMap = {
        ALLOW: 'ALLOWED',
        BLOCK: 'BLOCKED',
        WARN: 'WARNED',
        RESTRICT: 'BLOCKED'
      };
      detection.status = statusMap[action.toUpperCase()];
      detection.updatedAt = new Date().toISOString();
      detection.reviewedBy = adminId || 'admin';
      return { detection, previousStatus };
    });

    await auditService.recordAudit({
      detectionId: result.detection.id,
      userId: result.detection.userId,
      adminId: adminId || 'admin',
      action: `MANUAL_${action.toUpperCase()}`,
      reason: reason || '',
      previousStatus: result.previousStatus,
      newStatus: result.detection.status
    });

    if (action.toUpperCase() === 'RESTRICT') {
      await restrictionService.createRestriction({
        userId: result.detection.userId,
        restrictionType: 'TEMPORARY_POSTING_BAN',
        reason: reason || `Manually restricted following detection ${result.detection.id}`,
        durationMs: restrictionDurationMs,
        createdBy: adminId || 'admin',
        relatedDetectionId: result.detection.id
      });
    }

    res.json(result.detection);
  } catch (err) {
    next(err);
  }
}

// GET /api/spam/users/:userId/activity
async function userActivity(req, res, next) {
  try {
    const data = await activityService.getUserActivity(req.params.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// POST /api/spam/users/:userId/restrict
async function restrictUser(req, res, next) {
  try {
    const { reason, adminId, durationMs, restrictionType } = req.body;
    const restriction = await restrictionService.createRestriction({
      userId: req.params.userId,
      restrictionType: restrictionType || 'TEMPORARY_POSTING_BAN',
      reason: reason || 'Manually restricted by admin',
      durationMs,
      createdBy: adminId || 'admin'
    });

    await auditService.recordAudit({
      detectionId: null,
      userId: req.params.userId,
      adminId: adminId || 'admin',
      action: 'MANUAL_RESTRICT',
      reason: reason || 'Manually restricted by admin',
      previousStatus: 'ACTIVE',
      newStatus: 'RESTRICTED'
    });

    res.status(201).json(restriction);
  } catch (err) {
    next(err);
  }
}

// POST /api/spam/users/:userId/unrestrict
async function unrestrictUser(req, res, next) {
  try {
    const { adminId } = req.body;
    const removed = await restrictionService.removeActiveRestrictionsForUser(
      req.params.userId,
      adminId || 'admin'
    );

    await auditService.recordAudit({
      detectionId: null,
      userId: req.params.userId,
      adminId: adminId || 'admin',
      action: 'MANUAL_UNRESTRICT',
      reason: 'Restriction removed by admin',
      previousStatus: 'RESTRICTED',
      newStatus: 'ACTIVE'
    });

    res.json({ removed });
  } catch (err) {
    next(err);
  }
}

// GET /api/spam/audit
function audit(req, res, next) {
  try {
    const { userId, detectionId } = req.query;
    const log = auditService.getAuditLog({ userId, detectionId });
    res.json({ data: log });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyze,
  listDetections,
  stats,
  getDetection,
  takeAction,
  userActivity,
  restrictUser,
  unrestrictUser,
  audit
};
