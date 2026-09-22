const { v4: uuidv4 } = require('uuid');
const jsonStore = require('../utils/jsonStore');

const AUDIT_FILE = 'audit';

async function recordAudit({ detectionId, userId, adminId, action, reason, previousStatus, newStatus }) {
  const entry = {
    id: uuidv4(),
    detectionId,
    userId,
    adminId,
    action,
    reason: reason || '',
    previousStatus: previousStatus || null,
    newStatus: newStatus || null,
    timestamp: new Date().toISOString()
  };

  await jsonStore.update(AUDIT_FILE, [], (log) => {
    log.push(entry);
  });

  return entry;
}

function getAuditLog({ detectionId, userId } = {}) {
  let log = jsonStore.readJSON(AUDIT_FILE, []);
  if (detectionId) log = log.filter((e) => e.detectionId === detectionId);
  if (userId) log = log.filter((e) => e.userId === userId);
  return log.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

module.exports = { recordAudit, getAuditLog, AUDIT_FILE };
