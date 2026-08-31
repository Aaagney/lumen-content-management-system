// Goes to: client/src/services/adminService.js
//
// This is the ONLY file that should change when the real backend
// (MongoDB Atlas via the team's Express API) is ready.
// Every function here keeps the same name + return shape —
// components never talk to mockData directly.

import { getRawArticles, setRawArticles } from "../mockData/adminArticles";

// ---- READ ----

export const getAllArticles = () => [...getRawArticles()];

export const getReviewQueue = () =>
  getRawArticles().filter((a) => a.status === "pending" || a.status === "changes_requested");

export const getArticleById = (id) => getRawArticles().find((a) => a.id === id) || null;

export const getStats = () => {
  const all = getRawArticles();
  return {
    pending: all.filter((a) => a.status === "pending").length,
    changesRequested: all.filter((a) => a.status === "changes_requested").length,
    published: all.filter((a) => a.status === "published").length,
    rejected: all.filter((a) => a.status === "rejected").length,
  };
};

// ---- WRITE (admin actions) ----

const CURRENT_ADMIN = "Amara Silva";
const today = () => new Date().toISOString().slice(0, 10);

export const approveArticle = (id) => {
  const updated = getRawArticles().map((a) =>
    a.id === id
      ? { ...a, status: "published", reviewNote: null, reviewedBy: CURRENT_ADMIN, reviewedDate: today() }
      : a
  );
  setRawArticles(updated);
  return getArticleById(id);
};

export const rejectArticle = (id, reason) => {
  if (!reason || !reason.trim()) throw new Error("Rejection reason is required.");
  const updated = getRawArticles().map((a) =>
    a.id === id
      ? { ...a, status: "rejected", reviewNote: reason.trim(), reviewedBy: CURRENT_ADMIN, reviewedDate: today() }
      : a
  );
  setRawArticles(updated);
  return getArticleById(id);
};

export const requestChanges = (id, note) => {
  if (!note || !note.trim()) throw new Error("Change request notes are required.");
  const updated = getRawArticles().map((a) =>
    a.id === id
      ? { ...a, status: "changes_requested", reviewNote: note.trim(), reviewedBy: CURRENT_ADMIN, reviewedDate: today() }
      : a
  );
  setRawArticles(updated);
  return getArticleById(id);
};
