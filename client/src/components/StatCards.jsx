import React from 'react';
import { Clock, RefreshCw, Check, X } from 'lucide-react';

export default function StatCards({ stats, activeFilter, onFilterSelect }) {
  const cards = [
    {
      id: 'trusted',
      filterValue: 'Trusted',
      icon: <Check size={18} strokeWidth={2.5} />,
      colorClass: 'green',
      value: stats.trusted_users ?? 0,
      label: 'Trusted Users (80–100)',
      sub: 'Eligible for auto-approval'
    },
    {
      id: 'normal',
      filterValue: 'Normal',
      icon: <Clock size={18} strokeWidth={2.5} />,
      colorClass: 'yellow',
      value: stats.normal_users ?? 0,
      label: 'Normal Standing (50–79)',
      sub: 'Standard review queue'
    },
    {
      id: 'low_trust',
      filterValue: 'Low Trust',
      icon: <X size={18} strokeWidth={2.5} />,
      colorClass: 'red',
      value: stats.low_trust_users ?? 0,
      label: 'Low Trust (0–49)',
      sub: 'High-risk & flagged users'
    },
    {
      id: 'violations',
      filterValue: 'all',
      icon: <RefreshCw size={18} strokeWidth={2.5} />,
      colorClass: 'orange',
      value: stats.total_violations ?? 0,
      label: 'Total Violations Logged',
      sub: `${stats.total_reports ?? 0} user reports received`
    }
  ];

  return (
    <div className="stat-cards-grid">
      {cards.map((c) => {
        const isSelected = activeFilter === c.filterValue && c.filterValue !== 'all';
        return (
          <div
            key={c.id}
            className="stat-card"
            onClick={() => onFilterSelect && onFilterSelect(c.filterValue)}
            style={{
              cursor: onFilterSelect ? 'pointer' : 'default',
              borderColor: isSelected ? 'var(--primary)' : undefined,
              boxShadow: isSelected ? '0 0 0 1.5px var(--primary)' : undefined
            }}
          >
            <div className="stat-card-header">
              <div className={`stat-icon-circle ${c.colorClass}`}>
                {c.icon}
              </div>
            </div>
            <div className="stat-number">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        );
      })}
    </div>
  );
}
