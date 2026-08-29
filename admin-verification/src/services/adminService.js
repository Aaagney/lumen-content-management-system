// services/adminService.js
//
// This is the ONLY file that should change when the real backend
// (MongoDB Atlas via the team's Express API) is ready.
// Every function here keeps the same name + return shape —
// components never talk to mockData directly.
//
// TODO when backend is live:
//   - replace getRawArticles()/setRawArticles() calls with fetch("/api/articles...")
//   - make these functions async (they already return values that can be awaited
//     by callers using `await`, so calling code will not need to change)

import { getRawArticles, setRawArticles } from "../mockData/articles";

// ---- READ ----

export const getAllArticles = () => {
  return [...getRawArticles()];
};

export const getReviewQueue = () => {
  return getRawArticles().filter(
    (a) => a.status === "pending" || a.status === "changes_requested"
  );
};

export const getArticleById = (id) => {
  return getRawArticles().find((a) => a.id === id) || null;
};

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
// reviewerName should eventually come from the logged-in admin (User Management module).
// Hardcoded fallback here just so this module works standalone.

const CURRENT_ADMIN = "Amara Silva";

export const approveArticle = (id) => {
  const updated = getRawArticles().map((a) =>
    a.id === id
      ? {
          ...a,
          status: "published",
          reviewNote: null,
          reviewedBy: CURRENT_ADMIN,
          reviewedDate: new Date().toISOString().slice(0, 10),
        }
      : a
  );
  setRawArticles(updated);
  return getArticleById(id);
};

export const rejectArticle = (id, reason) => {
  if (!reason || !reason.trim()) {
    throw new Error("Rejection reason is required.");
  }
  const updated = getRawArticles().map((a) =>
    a.id === id
      ? {
          ...a,
          status: "rejected",
          reviewNote: reason.trim(),
          reviewedBy: CURRENT_ADMIN,
          reviewedDate: new Date().toISOString().slice(0, 10),
        }
      : a
  );
  setRawArticles(updated);
  return getArticleById(id);
};

export const requestChanges = (id, note) => {
  if (!note || !note.trim()) {
    throw new Error("Change request notes are required.");
  }
  const updated = getRawArticles().map((a) =>
    a.id === id
      ? {
          ...a,
          status: "changes_requested",
          reviewNote: note.trim(),
          reviewedBy: CURRENT_ADMIN,
          reviewedDate: new Date().toISOString().slice(0, 10),
        }
      : a
  );
  setRawArticles(updated);
  return getArticleById(id);
};
