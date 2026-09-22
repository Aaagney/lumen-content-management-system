const db = require('../config/db');

const VALID_APPEAL_STATUSES = ['Pending', 'Under Review', 'Approved', 'Rejected'];

// 1. GET /api/appeals - List appeals
exports.getAllAppeals = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.query;

    let query = `
      SELECT a.*, 
             u.name AS appellant_name, 
             u.role AS appellant_role, 
             u.avatar AS appellant_avatar,
             r.reported_type,
             r.reported_id,
             r.reason AS report_reason,
             r.status AS report_status,
             r.description AS report_description
      FROM appeals a
      LEFT JOIN users u ON a.appellant_id = u.id
      LEFT JOIN reports r ON a.report_id = r.id
      WHERE 1=1
    `;
    const params = [];

    // Normal users can only see their own appeals; Admins can see all
    if (user.role !== 'admin') {
      query += ` AND a.appellant_id = ?`;
      params.push(user.id);
    }

    if (status && VALID_APPEAL_STATUSES.includes(status)) {
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [appeals] = await db.query(query, params);
    res.json(appeals);
  } catch (error) {
    console.error('GET ALL APPEALS ERROR:', error);
    res.status(500).json({ error: 'Failed to retrieve appeals' });
  }
};

// 2. GET /api/appeals/:id - Get single appeal details
exports.getAppealById = async (req, res) => {
  try {
    const appealId = parseInt(req.params.id, 10);
    if (isNaN(appealId)) {
      return res.status(400).json({ message: 'Invalid appeal ID' });
    }

    const [rows] = await db.query(
      `SELECT a.*, 
              u.name AS appellant_name, 
              u.role AS appellant_role, 
              u.avatar AS appellant_avatar,
              r.reported_type,
              r.reported_id,
              r.reason AS report_reason,
              r.description AS report_description,
              r.status AS report_status,
              r.admin_note AS report_admin_note
       FROM appeals a
       LEFT JOIN users u ON a.appellant_id = u.id
       LEFT JOIN reports r ON a.report_id = r.id
       WHERE a.id = ?`,
      [appealId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Appeal not found' });
    }

    const appeal = rows[0];

    // Authorization: only the appellant or an admin can view this appeal
    if (req.user.role !== 'admin' && appeal.appellant_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this appeal' });
    }

    res.json(appeal);
  } catch (error) {
    console.error('GET APPEAL BY ID ERROR:', error);
    res.status(500).json({ error: 'Failed to retrieve appeal details' });
  }
};

// 3. POST /api/appeals - Create new appeal
exports.createAppeal = async (req, res) => {
  try {
    const appellant_id = req.user.id;
    const { report_id, reason, description } = req.body;

    const parsedReportId = parseInt(report_id, 10);
    if (isNaN(parsedReportId) || parsedReportId <= 0) {
      return res.status(400).json({ message: 'Valid report_id is required' });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Appeal reason is required' });
    }

    // Verify report exists
    const [reportRows] = await db.query('SELECT * FROM reports WHERE id = ?', [parsedReportId]);
    if (reportRows.length === 0) {
      return res.status(404).json({ message: 'The referenced report does not exist' });
    }

    // Prevent duplicate active appeals for the same report by the same user
    const [existing] = await db.query(
      `SELECT id FROM appeals 
       WHERE report_id = ? AND appellant_id = ? 
       AND status IN ('Pending', 'Under Review')`,
      [parsedReportId, appellant_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: 'You already have an active appeal submitted for this report.'
      });
    }

    const [result] = await db.query(
      `INSERT INTO appeals (report_id, appellant_id, reason, description, status, admin_note) 
       VALUES (?, ?, ?, ?, 'Pending', NULL)`,
      [parsedReportId, appellant_id, reason.trim(), description ? description.trim() : '']
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Appeal submitted successfully. It will be reviewed by an administrator.',
      appeal: {
        id: result.insertId,
        report_id: parsedReportId,
        appellant_id,
        reason: reason.trim(),
        description: description || '',
        status: 'Pending',
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('CREATE APPEAL ERROR:', error);
    res.status(500).json({ error: 'Failed to submit appeal' });
  }
};

// 4. PUT /api/appeals/:id/status - Update appeal status (Admin only)
exports.updateAppealStatus = async (req, res) => {
  try {
    const appealId = parseInt(req.params.id, 10);
    if (isNaN(appealId)) {
      return res.status(400).json({ message: 'Invalid appeal ID' });
    }

    const { status, admin_note } = req.body;

    if (!status || !VALID_APPEAL_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_APPEAL_STATUSES.join(', ')}`
      });
    }

    const [existing] = await db.query('SELECT * FROM appeals WHERE id = ?', [appealId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Appeal not found' });
    }

    const newAdminNote = admin_note !== undefined ? admin_note : existing[0].admin_note;

    await db.query(
      `UPDATE appeals 
       SET status = ?, admin_note = ? 
       WHERE id = ?`,
      [status, newAdminNote, appealId]
    );

    res.json({
      message: 'Appeal status updated successfully',
      appeal_id: appealId,
      status,
      admin_note: newAdminNote
    });
  } catch (error) {
    console.error('UPDATE APPEAL STATUS ERROR:', error);
    res.status(500).json({ error: 'Failed to update appeal status' });
  }
};
