// Goes to: client/src/components/admin/StatsCards.jsx
import React from "react";
import { Clock, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export default function StatsCards({ stats }) {
  const items = [
    { key: "pending", label: "Pending Review", value: stats.pending, icon: Clock, tone: "tone-amber" },
    { key: "changesRequested", label: "Changes Requested", value: stats.changesRequested, icon: RefreshCw, tone: "tone-amber" },
    { key: "published", label: "Published", value: stats.published, icon: CheckCircle2, tone: "tone-green" },
    { key: "rejected", label: "Rejected", value: stats.rejected, icon: XCircle, tone: "tone-red" },
  ];

  return (
    <div className="admin-stats-row">
      {items.map(({ key, label, value, icon: Icon, tone }) => (
        <div className="admin-stat-card" key={key}>
          <div className={`admin-stat-icon-circle ${tone}`}>
            <Icon size={18} />
          </div>
          <div className="admin-stat-number">{value}</div>
          <div className="admin-stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}
