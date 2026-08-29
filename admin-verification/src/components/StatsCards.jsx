// components/StatsCards.jsx
import React from "react";

export default function StatsCards({ stats }) {
  const items = [
    { label: "Pending Review", value: stats.pending },
    { label: "Changes Requested", value: stats.changesRequested },
    { label: "Published", value: stats.published },
    { label: "Rejected", value: stats.rejected },
  ];

  return (
    <div className="stats-row">
      {items.map((item) => (
        <div className="stat-card" key={item.label}>
          <div className="stat-number">{item.value}</div>
          <div className="stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
