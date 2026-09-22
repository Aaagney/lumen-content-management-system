const db = require('../config/db');

const VALID_REASONS = [
  'Spam',
  'Harassment',
  'Hate Speech',
  'Inappropriate Content',
  'Suspicious Link',
  'Misinformation',
  'Privacy / Personal Information',
  'Other'
];

const VALID_TYPES = ['article', 'comment', 'user'];
const VALID_STATUSES = ['Pending', 'Under Review', 'Resolved', 'Rejected'];

// Helper to fetch details about the reported entity
async function getReportedEntityDetails(type, id) {
  try {
    if (type === 'article') {
      const [rows] = await db.query(
        `SELECT a.id, a.title, a.subtitle, a.author_id, u.name AS author_name 
         FROM articles a 
         LEFT JOIN users u ON a.author_id = u.id 
         WHERE a.id = ?`,
        [id]
      );
      if (rows.length > 0) {
        return {
          title: rows[0].title,
          subtitle: rows[0].subtitle,
          author_id: rows[0].author_id,
          author_name: rows[0].author_name,
          url: `/article/${rows[0].id}`
        };
      }
    } else if (type === 'comment') {
      const [rows] = await db.query(
        `SELECT c.id, c.content, c.article_id, c.user_id, u.name AS user_name, a.title AS article_title 
         FROM comments c 
         LEFT JOIN users u ON c.user_id = u.id 
         LEFT JOIN articles a ON c.article_id = a.id 
         WHERE c.id = ?`,
        [id]
      );
      if (rows.length > 0) {
        return {
          snippet: rows[0].content,
          article_id: rows[0].article_id,
          article_title: rows[0].article_title,
          author_id: rows[0].user_id,
          author_name: rows[0].user_name,
          url: `/article/${rows[0].article_id}`
        };
      }
    } else if (type === 'user') {
      const [rows] = await db.query(
        `SELECT id, name, role, avatar FROM users WHERE id = ?`,
        [id]
      );
      if (rows.length > 0) {
        return {
          name: rows[0].name,
          role: rows[0].role,
          avatar: rows[0].avatar,
          url: `/profile/${rows[0].id}`
        };
      }
    }
  } catch (err) {
    console.error('Error fetching reported entity:', err);
  }
  return null;
}

// 1. GET /api/reports - List reports
exports.getAllReports = async (req, res) => {
  try {
    const user = req.user;
    const { status, reported_type } = req.query;

    let query = `
      SELECT r.*, 
             u.name AS reporter_name, 
             u.role AS reporter_role, 
             u.avatar AS reporter_avatar
      FROM reports r
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Normal users can only see their own reports; Admins can see all
    if (user.role !== 'admin') {
      query += ` AND r.reporter_id = ?`;
      params.push(user.id);
    }

    if (status && VALID_STATUSES.includes(status)) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (reported_type && VALID_TYPES.includes(reported_type)) {
      query += ` AND r.reported_type = ?`;
      params.push(reported_type);
    }

    query += ` ORDER BY r.created_at DESC`;

    const [reports] = await db.query(query, params);

    // Enrich each report with target entity snippet / title
    const enrichedReports = await Promise.all(
      reports.map(async (rep) => {
        const entityDetails = await getReportedEntityDetails(rep.reported_type, rep.reported_id);
        return {
          ...rep,
          entity_details: entityDetails
        };
      })
    );

    res.json(enrichedReports);
  } catch (error) {
    console.error('GET ALL REPORTS ERROR:', error);
    res.status(500).json({ error: 'Failed to retrieve reports' });
  }
};

// 2. GET /api/reports/:id - Get single report details
exports.getReportById = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const [rows] = await db.query(
      `SELECT r.*, 
              u.name AS reporter_name, 
              u.role AS reporter_role, 
              u.avatar AS reporter_avatar,
              u.bio AS reporter_bio
       FROM reports r
       LEFT JOIN users u ON r.reporter_id = u.id
       WHERE r.id = ?`,
      [reportId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = rows[0];

    // Authorization: only the reporter or an admin can view this report
    if (req.user.role !== 'admin' && report.reporter_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this report' });
    }

    // Attach entity details
    report.entity_details = await getReportedEntityDetails(report.reported_type, report.reported_id);

    // Attach any appeals for this report
    const [appeals] = await db.query(
      `SELECT a.*, u.name AS appellant_name, u.role AS appellant_role 
       FROM appeals a
       LEFT JOIN users u ON a.appellant_id = u.id
       WHERE a.report_id = ?
       ORDER BY a.created_at DESC`,
      [reportId]
    );
    report.appeals = appeals;

    res.json(report);
  } catch (error) {
    console.error('GET REPORT BY ID ERROR:', error);
    res.status(500).json({ error: 'Failed to retrieve report details' });
  }
};

// 3. POST /api/reports - Create new report
exports.createReport = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const { reported_type, reported_id, reason, description } = req.body;

    // Validate reported_type
    if (!reported_type || !VALID_TYPES.includes(reported_type.toLowerCase())) {
      return res.status(400).json({
        message: `Invalid reported_type. Must be one of: ${VALID_TYPES.join(', ')}`
      });
    }

    const targetType = reported_type.toLowerCase();
    const targetId = parseInt(reported_id, 10);

    if (isNaN(targetId) || targetId <= 0) {
      return res.status(400).json({ message: 'Invalid reported_id' });
    }

    // Validate reason
    if (!reason || !VALID_REASONS.includes(reason)) {
      return res.status(400).json({
        message: `Invalid reason. Must be one of: ${VALID_REASONS.join(', ')}`
      });
    }

    // Prevent reporting oneself
    if (targetType === 'user' && targetId === reporter_id) {
      return res.status(400).json({ message: 'You cannot report your own account' });
    }

    // Verify reported entity exists
    const entityDetails = await getReportedEntityDetails(targetType, targetId);
    if (!entityDetails) {
      return res.status(404).json({ message: `The reported ${targetType} does not exist.` });
    }

    // Prevent duplicate pending reports from the same user for the same entity
    const [existing] = await db.query(
      `SELECT id FROM reports 
       WHERE reporter_id = ? AND reported_type = ? AND reported_id = ? 
       AND status IN ('Pending', 'Under Review')`,
      [reporter_id, targetType, targetId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: `You already have an active report under review for this ${targetType}.`
      });
    }

    // Placeholder AI simulation metrics (ready for future Phase 3 AI moderation module integration)
    // Real AI model is not executed here, these are placeholders conforming to requirements.
    const risk_score = null;
    const risk_level = null;
    const ai_result = null;
    const ai_reason = null;

    const [result] = await db.query(
      `INSERT INTO reports 
       (reporter_id, reported_type, reported_id, reason, description, status, admin_note, risk_score, risk_level, ai_result, ai_reason) 
       VALUES (?, ?, ?, ?, ?, 'Pending', NULL, ?, ?, ?, ?)`,
      [
        reporter_id,
        targetType,
        targetId,
        reason,
        description ? description.trim() : '',
        risk_score,
        risk_level,
        ai_result,
        ai_reason
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Report submitted successfully. Our moderation team will review it.',
      report: {
        id: result.insertId,
        reporter_id,
        reported_type: targetType,
        reported_id: targetId,
        reason,
        description: description || '',
        status: 'Pending',
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('CREATE REPORT ERROR:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
};

// 4. PUT /api/reports/:id/status - Update report status (Admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    if (isNaN(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const { status, admin_note, risk_score, risk_level, ai_result, ai_reason } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const [existing] = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Preserve existing AI values if not provided
    const newRiskScore = risk_score !== undefined ? risk_score : existing[0].risk_score;
    const newRiskLevel = risk_level !== undefined ? risk_level : existing[0].risk_level;
    const newAiResult = ai_result !== undefined ? ai_result : existing[0].ai_result;
    const newAiReason = ai_reason !== undefined ? ai_reason : existing[0].ai_reason;
    const newAdminNote = admin_note !== undefined ? admin_note : existing[0].admin_note;

    await db.query(
      `UPDATE reports 
       SET status = ?, admin_note = ?, risk_score = ?, risk_level = ?, ai_result = ?, ai_reason = ? 
       WHERE id = ?`,
      [status, newAdminNote, newRiskScore, newRiskLevel, newAiResult, newAiReason, reportId]
    );

    res.json({
      message: 'Report status updated successfully',
      report_id: reportId,
      status,
      admin_note: newAdminNote
    });
  } catch (error) {
    console.error('UPDATE REPORT STATUS ERROR:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
};
