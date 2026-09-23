import styles from "../ContentApproval.module.css";
import { ApprovalStatusBadge, RiskBadge } from "./ApprovalStatusBadge";
import { ApprovalActions } from "./ApprovalActions";

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ApprovalRow({ item, onApprove, onReject, busyId }) {
  return (
    <tr className={styles.row}>
      <td>
        <div className={styles.title}>{item.title}</div>
        <div className={styles.type}>{item.type.toUpperCase()}</div>
      </td>
      <td>{item.author}</td>
      <td>
        <RiskBadge score={item.aiRiskScore} level={item.aiRiskLevel} />
      </td>
      <td>{timeAgo(item.submittedAt)}</td>
      <td>
        <ApprovalStatusBadge status={item.status} />
      </td>
      <td>
        <ApprovalActions
          item={item}
          onApprove={onApprove}
          onReject={onReject}
          busy={busyId === item.id}
        />
      </td>
    </tr>
  );
}
