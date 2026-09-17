import React from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, Shield, AlertTriangle } from 'lucide-react';

export default function UserList({
  users,
  selectedUserId,
  onSelectUser,
  searchQuery,
  onSearchChange,
  trustLevelFilter,
  onTrustLevelChange,
  statusFilter,
  onStatusChange,
  loading
}) {
  const getTrustBadgeClass = (level) => {
    switch (level) {
      case 'Trusted':
        return 'trusted';
      case 'Low Trust':
        return 'low-trust';
      default:
        return 'normal';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'active';
      case 'Suspended':
        return 'suspended';
      default:
        return 'under-review';
    }
  };

  return (
    <section className="directory-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-header-title">
          USER DIRECTORY ({users.length})
        </h2>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar-card">
        <div className="search-box">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select
            className="filter-select"
            value={trustLevelFilter}
            onChange={(e) => onTrustLevelChange(e.target.value)}
            aria-label="Filter by Trust Level"
          >
            <option value="all">All Trust Levels</option>
            <option value="Trusted">Trusted (80–100)</option>
            <option value="Normal">Normal (50–79)</option>
            <option value="Low Trust">Low Trust (0–49)</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by Account Status"
          >
            <option value="all">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Under Review">Under Review</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* User Items List */}
      <div className="user-list">
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading user directory...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No users match the current search or filters.
          </div>
        ) : (
          users.map((user) => {
            const isSelected = selectedUserId === user.id;
            const trustClass = getTrustBadgeClass(user.trust_level);

            return (
              <div
                key={user.id}
                className={`user-item-card ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectUser(user.id)}
              >
                <div className="user-item-top">
                  <div className="user-item-info">
                    <div className={`user-avatar ${trustClass}`}>
                      {user.avatar_initials || user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="user-item-name">{user.name}</div>
                      <div className="user-item-meta">
                        {user.role} · {user.email}
                      </div>
                    </div>
                  </div>

                  <span className={`status-badge ${trustClass}`}>
                    {user.trust_level}
                  </span>
                </div>

                <div className="user-item-bottom">
                  <div className="score-pill-tag">
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Trust Score:</span>
                    <span style={{ 
                      color: user.trust_score >= 80 ? '#2E7D32' : user.trust_score >= 50 ? '#D97706' : '#C62828',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '14px'
                    }}>
                      {user.trust_score}/100
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {user.violations > 0 && (
                      <span style={{ fontSize: '11px', color: '#C62828', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <AlertTriangle size={12} /> {user.violations} viol.
                      </span>
                    )}
                    <span className={`account-status-badge ${getStatusBadgeClass(user.account_status)}`}>
                      {user.account_status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
