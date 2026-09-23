import { useEffect, useMemo, useState } from "react";
import styles from "./ContentApproval.module.css";
import { ApprovalRow } from "./components/ApprovalRow";
import {
  getAllApprovals,
  approveContent,
  rejectContent,
} from "./services/approvalService";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

export default function ContentApproval() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  async function loadData() {
    setLoading(true);
    const data = await getAllApprovals();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((i) => i.status === "pending_approval").length,
      approved: items.filter((i) => i.status === "approved").length,
      rejected: items.filter((i) => i.status === "rejected").length,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "Pending" && item.status === "pending_approval") ||
        (filter === "Approved" && item.status === "approved") ||
        (filter === "Rejected" && item.status === "rejected");

      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [items, filter, search]);

  async function handleApprove(id) {
    setBusyId(id);
    try {
      const updated = await approveContent(id);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setToast({ type: "success", text: `"${updated.title}" approved and published.` });
    } finally {
      setBusyId(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  async function handleReject(id, reason) {
    setBusyId(id);
    try {
      const updated = await rejectContent(id, reason);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      setToast({ type: "error", text: `"${updated.title}" rejected.` });
    } finally {
      setBusyId(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Smart Content Approval</h1>
        <p className={styles.subtitle}>
          Review content that has already passed AI moderation and give the final
          admin sign-off before it goes live.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>TOTAL</div>
          <div className={styles.statValue}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>PENDING</div>
          <div className={`${styles.statValue} ${styles.pendingColor}`}>{stats.pending}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>APPROVED</div>
          <div className={`${styles.statValue} ${styles.approvedColor}`}>{stats.approved}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>REJECTED</div>
          <div className={`${styles.statValue} ${styles.rejectedColor}`}>{stats.rejected}</div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.filterGroup}>
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Loading approvals…</div>
        ) : visibleItems.length === 0 ? (
          <div className={styles.emptyState}>Nothing to show here.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Content</th>
                <th>Author</th>
                <th>AI Risk</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <ApprovalRow
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  busyId={busyId}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
