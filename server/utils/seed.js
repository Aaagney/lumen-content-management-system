/**
 * Seed script — populates data/*.json with realistic demo data so the
 * admin dashboard is populated on first run. Run with `npm run seed`.
 * Safe to re-run: it always regenerates from scratch.
 */
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const jsonStore = require('./jsonStore');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const users = [
  { userId: 'u-001', userName: 'John Mathew' },
  { userId: 'u-002', userName: 'David Wilson' },
  { userId: 'u-003', userName: 'Sarah Thomas' },
  { userId: 'u-004', userName: 'Alex Kumar' },
  { userId: 'u-005', userName: 'Priya Nair' },
  { userId: 'u-006', userName: 'SpamBot99' }
];

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function tsHoursAgo(h) {
  return Date.now() - h * 60 * 60 * 1000;
}

const detections = [
  {
    id: uuidv4(),
    userId: 'u-001',
    userName: 'John Mathew',
    contentId: uuidv4(),
    contentType: 'post',
    text: 'Excited to share my new article on climate research findings!',
    riskScore: 5,
    riskLevel: 'LOW',
    action: 'ALLOW',
    status: 'ALLOWED',
    reasons: [],
    signals: {
      duplicateContent: false,
      excessiveActivity: false,
      repeatedPosting: false,
      suspiciousLinks: false,
      excessiveLinks: false,
      promotionalContent: false,
      repeatedDomain: false,
      previousViolations: false
    },
    matchedContentId: null,
    similarityScore: null,
    suspiciousUrls: [],
    totalLinks: 0,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2)
  },
  {
    id: uuidv4(),
    userId: 'u-002',
    userName: 'David Wilson',
    contentId: uuidv4(),
    contentType: 'comment',
    text: 'Buy now! Limited offer! Click here for free money http://bit.ly/xyz123',
    riskScore: 70,
    riskLevel: 'HIGH',
    action: 'BLOCK',
    status: 'BLOCKED',
    reasons: [
      'Contains promotional/spam-like language',
      'Contains suspicious links (shortened, IP-based, or obfuscated)',
      'Same content repeated recently'
    ],
    signals: {
      duplicateContent: false,
      excessiveActivity: false,
      repeatedPosting: true,
      suspiciousLinks: true,
      excessiveLinks: false,
      promotionalContent: true,
      repeatedDomain: false,
      previousViolations: false
    },
    matchedContentId: null,
    similarityScore: null,
    suspiciousUrls: [{ url: 'http://bit.ly/xyz123', hostname: 'bit.ly', isShortened: true, isIpBased: false, isObfuscated: false }],
    totalLinks: 1,
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(8)
  },
  {
    id: uuidv4(),
    userId: 'u-003',
    userName: 'Sarah Thomas',
    contentId: uuidv4(),
    contentType: 'post',
    text: 'Check out this great deal on electronics at my store',
    riskScore: 40,
    riskLevel: 'MEDIUM',
    action: 'FLAG',
    status: 'PENDING_REVIEW',
    reasons: ['Contains promotional/spam-like language', 'Excessive posting/commenting activity in a short period'],
    signals: {
      duplicateContent: false,
      excessiveActivity: true,
      repeatedPosting: false,
      suspiciousLinks: false,
      excessiveLinks: false,
      promotionalContent: true,
      repeatedDomain: false,
      previousViolations: false
    },
    matchedContentId: null,
    similarityScore: null,
    suspiciousUrls: [],
    totalLinks: 0,
    createdAt: hoursAgo(15),
    updatedAt: hoursAgo(15)
  },
  {
    id: uuidv4(),
    userId: 'u-006',
    userName: 'SpamBot99',
    contentId: uuidv4(),
    contentType: 'comment',
    text: 'Great post!!! visit http://192.168.10.5/promo and http://bit.ly/abc and http://tinyurl.com/def now',
    riskScore: 90,
    riskLevel: 'HIGH',
    action: 'BLOCK',
    status: 'BLOCKED',
    reasons: [
      'Contains suspicious links (shortened, IP-based, or obfuscated)',
      'Contains an unusually high number of links (3)',
      'User has previous high-risk violations'
    ],
    signals: {
      duplicateContent: false,
      excessiveActivity: true,
      repeatedPosting: true,
      suspiciousLinks: true,
      excessiveLinks: true,
      promotionalContent: false,
      repeatedDomain: false,
      previousViolations: true
    },
    matchedContentId: null,
    similarityScore: null,
    suspiciousUrls: [
      { url: 'http://192.168.10.5/promo', hostname: '192.168.10.5', isShortened: false, isIpBased: true, isObfuscated: false },
      { url: 'http://bit.ly/abc', hostname: 'bit.ly', isShortened: true, isIpBased: false, isObfuscated: false },
      { url: 'http://tinyurl.com/def', hostname: 'tinyurl.com', isShortened: true, isIpBased: false, isObfuscated: false }
    ],
    totalLinks: 3,
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1)
  },
  {
    id: uuidv4(),
    userId: 'u-004',
    userName: 'Alex Kumar',
    contentId: uuidv4(),
    contentType: 'post',
    text: 'Just published my quiz on world capitals, check it out!',
    riskScore: 0,
    riskLevel: 'LOW',
    action: 'ALLOW',
    status: 'ALLOWED',
    reasons: [],
    signals: {
      duplicateContent: false,
      excessiveActivity: false,
      repeatedPosting: false,
      suspiciousLinks: false,
      excessiveLinks: false,
      promotionalContent: false,
      repeatedDomain: false,
      previousViolations: false
    },
    matchedContentId: null,
    similarityScore: null,
    suspiciousUrls: [],
    totalLinks: 0,
    createdAt: hoursAgo(32),
    updatedAt: hoursAgo(32)
  }
];

const restrictions = [
  {
    id: uuidv4(),
    userId: 'u-006',
    restrictionType: 'TEMPORARY_POSTING_BAN',
    reason: 'Automatic restriction: 3 high-risk detections within 24 hours',
    startTime: hoursAgo(1),
    endTime: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    active: true,
    createdBy: 'SYSTEM',
    relatedDetectionId: detections[3].id,
    createdAt: hoursAgo(1)
  },
  {
    id: uuidv4(),
    userId: 'u-002',
    restrictionType: 'TEMPORARY_POSTING_BAN',
    reason: 'Manually restricted after repeated spam comments',
    startTime: hoursAgo(48),
    endTime: hoursAgo(24),
    active: false,
    createdBy: 'admin',
    relatedDetectionId: detections[1].id,
    removedBy: 'admin',
    removedAt: hoursAgo(24),
    createdAt: hoursAgo(48)
  }
];

const audit = [
  {
    id: uuidv4(),
    detectionId: detections[1].id,
    userId: 'u-002',
    adminId: 'SYSTEM',
    action: 'AUTO_BLOCK',
    reason: detections[1].reasons.join('; '),
    previousStatus: null,
    newStatus: 'BLOCKED',
    timestamp: hoursAgo(8)
  },
  {
    id: uuidv4(),
    detectionId: detections[3].id,
    userId: 'u-006',
    adminId: 'SYSTEM',
    action: 'AUTO_BLOCK',
    reason: detections[3].reasons.join('; '),
    previousStatus: null,
    newStatus: 'BLOCKED',
    timestamp: hoursAgo(1)
  },
  {
    id: uuidv4(),
    detectionId: null,
    userId: 'u-006',
    adminId: 'SYSTEM',
    action: 'AUTO_RESTRICT',
    reason: 'Automatic restriction: 3 high-risk detections within 24 hours',
    previousStatus: 'ACTIVE',
    newStatus: 'RESTRICTED',
    timestamp: hoursAgo(1)
  }
];

// Content log entries back this data so future duplicate/activity checks
// have realistic history to compare against.
const contentLog = detections.map((d) => ({
  contentId: d.contentId,
  userId: d.userId,
  contentType: d.contentType,
  text: d.text,
  domains: (d.suspiciousUrls || []).map((u) => u.hostname).filter(Boolean),
  timestamp: new Date(d.createdAt).getTime()
}));

jsonStore.writeJSON('detections', detections);
jsonStore.writeJSON('restrictions', restrictions);
jsonStore.writeJSON('audit', audit);
jsonStore.writeJSON('contentLog', contentLog);
jsonStore.writeJSON('users', users);

console.log('Seed data written to server/data/*.json');
console.log(`  detections: ${detections.length}`);
console.log(`  restrictions: ${restrictions.length}`);
console.log(`  audit entries: ${audit.length}`);
