// In-memory mock store — replace with a Mongoose model
// (e.g. ContentApproval) backed by MongoDB Atlas once ready.

let approvals = [
  {
    id: "apr-001",
    title: "Introduction to Machine Learning",
    type: "article",
    author: "John Mathew",
    aiRiskScore: 0.04,
    aiRiskLevel: "LOW",
    submittedAt: "2026-09-19T09:00:00Z",
    status: "pending_approval",
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
];

module.exports = {
  getAll: () => approvals,
  setAll: (next) => {
    approvals = next;
  },
};
