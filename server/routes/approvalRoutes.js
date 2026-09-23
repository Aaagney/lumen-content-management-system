const express = require("express");
const router = express.Router();
const { getApprovals, approveItem, rejectItem } = require("../controllers/approvalController");

// GET /api/approvals            -> all items
// GET /api/approvals?status=pending_approval
router.get("/", getApprovals);

// POST /api/approvals/:id/approve   { note?: string }
router.post("/:id/approve", approveItem);

// POST /api/approvals/:id/reject    { reason: string }
router.post("/:id/reject", rejectItem);

module.exports = router;

/*
 Wire this into your main server/app.js:

   const approvalRoutes = require("./routes/approvalRoutes");
   app.use("/api/approvals", approvalRoutes);
*/
