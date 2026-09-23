import { useState } from "react";
import styles from "../ContentApproval.module.css";

export function ApprovalActions({ item, onApprove, onReject, busy }) {
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState("");

  if (item.status !== "pending_approval") {
    return <span className={styles.decidedNote}>{item.moderatorNote || "—"}</span>;
  }

  if (showReasonBox) {
    return (
      <div className={styles.reasonBox}>
        <input
          className={styles.reasonInput}
          placeholder="Reason for rejection..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        <div className={styles.reasonActions}>
          <button
            className={styles.rejectConfirmBtn}
            disabled={!reason.trim() || busy}
            onClick={() => onReject(item.id, reason)}
          >
            Confirm
          </button>
          <button
            className={styles.cancelBtn}
            onClick={() => {
              setShowReasonBox(false);
              setReason("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actionsRow}>
      <button className={styles.approveBtn} disabled={busy} onClick={() => onApprove(item.id)}>
        Approve
      </button>
      <button className={styles.rejectBtn} disabled={busy} onClick={() => setShowReasonBox(true)}>
        Reject
      </button>
    </div>
  );
}
