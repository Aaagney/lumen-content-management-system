import styles from "../ContentApproval.module.css";

const STATUS_LABEL = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

const RISK_CLASS = {
  LOW: styles.riskLow,
  MEDIUM: styles.riskMedium,
  HIGH: styles.riskHigh,
};

export function ApprovalStatusBadge({ status }) {
  const className =
    status === "approved"
      ? styles.badgeApproved
      : status === "rejected"
      ? styles.badgeRejected
      : styles.badgePending;

  return <span className={className}>{STATUS_LABEL[status] || status}</span>;
}

export function RiskBadge({ score, level }) {
  return (
    <span className={RISK_CLASS[level] || ""}>
      {score.toFixed(2)} ({level})
    </span>
  );
}
