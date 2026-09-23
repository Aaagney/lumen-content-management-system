// Mock data — content that has passed AI moderation and is
// awaiting final admin verification/approval before publishing.
// Replace with real API data once the backend route is wired up.

let mockApprovals = [
  {
    id: "apr-001",
    title: "Introduction to Machine Learning",
    type: "article",
    author: "John Mathew",
    aiRiskScore: 0.04,
    aiRiskLevel: "LOW",
    submittedAt: "2026-09-19T09:00:00Z",
    status: "pending_approval", // pending_approval | approved | rejected
    moderatorNote: "",
  },
  {
    id: "apr-002",
    title: "Advanced Python Quiz",
    type: "quiz",
    author: "Alex Kumar",
    aiRiskScore: 0.18,
    aiRiskLevel: "LOW",
    submittedAt: "2026-09-18T14:20:00Z",
    status: "pending_approval",
    moderatorNote: "",
  },
  {
    id: "apr-003",
    title: "Web Development Fundamentals",
    type: "article",
    author: "Emma Johnson",
    aiRiskScore: 0.07,
    aiRiskLevel: "LOW",
    submittedAt: "2026-09-17T11:05:00Z",
    status: "approved",
    moderatorNote: "Looks good, approved.",
  },
  {
    id: "apr-004",
    title: "Cryptocurrency Investment Guide",
    type: "article",
    author: "Sarah Thomas",
    aiRiskScore: 0.61,
    aiRiskLevel: "MEDIUM",
    submittedAt: "2026-09-19T08:40:00Z",
    status: "pending_approval",
    moderatorNote: "",
  },
  {
    id: "apr-005",
    title: "JavaScript Basics Quiz",
    type: "quiz",
    author: "Lisa Park",
    aiRiskScore: 0.03,
    aiRiskLevel: "LOW",
    submittedAt: "2026-09-16T10:15:00Z",
    status: "rejected",
    moderatorNote: "Duplicate of an existing quiz.",
  },
];

export function _getAll() {
  return mockApprovals;
}

export function _setAll(next) {
  mockApprovals = next;
}
