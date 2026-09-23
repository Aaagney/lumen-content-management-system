const store = require("../data/mockApprovals");

// GET /api/approvals?status=pending_approval
function getApprovals(req, res) {
  const { status } = req.query;
  const all = store.getAll();
  const result = status ? all.filter((item) => item.status === status) : all;
  res.json(result);
}

// POST /api/approvals/:id/approve
function approveItem(req, res) {
  const { id } = req.params;
  const { note = "" } = req.body;
  const all = store.getAll();
  const item = all.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: "Content not found." });
  }
  if (item.status !== "pending_approval") {
    return res.status(400).json({ error: "Only pending items can be approved." });
  }

  const updated = all.map((i) =>
    i.id === id
      ? { ...i, status: "approved", moderatorNote: note, decidedAt: new Date().toISOString() }
      : i
  );
  store.setAll(updated);
  res.json(updated.find((i) => i.id === id));
}

// POST /api/approvals/:id/reject
function rejectItem(req, res) {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: "A reason is required to reject content." });
  }

  const all = store.getAll();
  const item = all.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: "Content not found." });
  }
  if (item.status !== "pending_approval") {
    return res.status(400).json({ error: "Only pending items can be rejected." });
  }

  const updated = all.map((i) =>
    i.id === id
      ? { ...i, status: "rejected", moderatorNote: reason, decidedAt: new Date().toISOString() }
      : i
  );
  store.setAll(updated);
  res.json(updated.find((i) => i.id === id));
}

module.exports = { getApprovals, approveItem, rejectItem };
