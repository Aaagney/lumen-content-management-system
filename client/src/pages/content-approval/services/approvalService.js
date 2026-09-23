// approvalService.js
// Service layer for the Smart Content Approval module.
// Talks to mock data for now — swap the body of each function for a
// real `fetch("/api/approvals/...")` call once the Express routes
// (see server/routes/approvalRoutes.js) are connected.

import { _getAll, _setAll } from "../data/mockApprovals";

const SIMULATED_DELAY_MS = 350;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));
}

/**
 * Get all content items currently awaiting admin approval
 * (i.e. content that already passed AI moderation).
 */
export async function getPendingApprovals() {
  const all = _getAll();
  return delay(all.filter((item) => item.status === "pending_approval"));
}

/**
 * Get every item regardless of status (pending / approved / rejected),
 * useful for a full history / audit view.
 */
export async function getAllApprovals() {
  return delay([..._getAll()]);
}

/**
 * Approve a content item — marks it as approved so it can be published.
 * @param {string} id
 * @param {string} [note] optional moderator note
 */
export async function approveContent(id, note = "") {
  const all = _getAll();
  const updated = all.map((item) =>
    item.id === id
      ? { ...item, status: "approved", moderatorNote: note, decidedAt: new Date().toISOString() }
      : item
  );
  _setAll(updated);
  const result = updated.find((item) => item.id === id);
  return delay(result);
}

/**
 * Reject a content item — a reason/note is required so the author
 * understands why it wasn't approved.
 * @param {string} id
 * @param {string} reason
 */
export async function rejectContent(id, reason) {
  if (!reason || !reason.trim()) {
    throw new Error("A reason is required to reject content.");
  }
  const all = _getAll();
  const updated = all.map((item) =>
    item.id === id
      ? { ...item, status: "rejected", moderatorNote: reason, decidedAt: new Date().toISOString() }
      : item
  );
  _setAll(updated);
  const result = updated.find((item) => item.id === id);
  return delay(result);
}

/**
 * Bulk-approve helper, handy for a "select all low-risk" action.
 * @param {string[]} ids
 */
export async function bulkApprove(ids) {
  const all = _getAll();
  const updated = all.map((item) =>
    ids.includes(item.id)
      ? { ...item, status: "approved", decidedAt: new Date().toISOString() }
      : item
  );
  _setAll(updated);
  return delay(updated.filter((item) => ids.includes(item.id)));
}
