import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import UserList from '../components/UserList';
import UserDetail from '../components/UserDetail';
import UpdateReputationModal from '../components/UpdateReputationModal';
import {
  fetchDashboardStats,
  fetchUsers,
  fetchUserDetail,
  fetchUserHistory,
  recordReputationAction,
  updateUserStatus,
  resetDatabaseSeed
} from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReputationDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState({
    total_users: 0,
    trusted_users: 0,
    normal_users: 0,
    low_trust_users: 0,
    total_violations: 0,
    total_reports: 0
  });

  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [trustLevelFilter, setTrustLevelFilter] = useState(searchParams.get('trust_level') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  // Loading & UI States
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [isResettingDb, setIsResettingDb] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Dashboard Aggregate Stats
  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  // Load Users List with Filters
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (trustLevelFilter !== 'all') params.trust_level = trustLevelFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await fetchUsers(params);
      setUsers(data);

      // Auto-select first user if none selected or if selected user not in filtered list
      if (data.length > 0) {
        if (!selectedUserId || !data.some((u) => u.id === selectedUserId)) {
          setSelectedUserId(data[0].id);
        }
      } else {
        setSelectedUserId(null);
        setSelectedUser(null);
        setUserHistory([]);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [searchQuery, trustLevelFilter, statusFilter, selectedUserId]);

  // Load Selected User Detail and History
  const loadUserDetailAndHistory = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingDetail(true);
    try {
      const [detailData, historyData] = await Promise.all([
        fetchUserDetail(userId),
        fetchUserHistory(userId)
      ]);
      setSelectedUser(detailData);
      setUserHistory(historyData);
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Sync with URL params
  useEffect(() => {
    const nextParams = {};
    if (searchQuery) nextParams.search = searchQuery;
    if (trustLevelFilter !== 'all') nextParams.trust_level = trustLevelFilter;
    if (statusFilter !== 'all') nextParams.status = statusFilter;
    setSearchParams(nextParams, { replace: true });
  }, [searchQuery, trustLevelFilter, statusFilter, setSearchParams]);

  // Initial load
  useEffect(() => {
    loadStats();
  }, []);

  // Reload users when filters change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reload details when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      loadUserDetailAndHistory(selectedUserId);
    }
  }, [selectedUserId, loadUserDetailAndHistory]);

  // Handle Record Reputation Action Submit
  const handleRecordReputation = async (formData) => {
    if (!selectedUserId) return;
    setIsSubmittingAction(true);
    try {
      const response = await recordReputationAction(selectedUserId, formData);
      showToast(`Reputation updated for ${selectedUser.name}!`);
      setIsModalOpen(false);

      // Refresh data
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadUserDetailAndHistory(selectedUserId)
      ]);
    } catch (err) {
      console.error('Failed to record reputation action:', err);
      alert(err.response?.data?.error || 'Failed to update reputation');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Account Status Change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      showToast(`Account status updated to ${newStatus}`);
      await Promise.all([
        loadUsers(),
        loadUserDetailAndHistory(userId)
      ]);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle Stat Card Filter Click
  const handleStatCardClick = (level) => {
    if (level === trustLevelFilter) {
      setTrustLevelFilter('all');
    } else {
      setTrustLevelFilter(level);
    }
  };

  // Handle Reset DB Seed
  const handleResetDb = async () => {
    if (!window.confirm('Reset MySQL database to initial seed dataset?')) return;
    setIsResettingDb(true);
    try {
      await resetDatabaseSeed();
      showToast('Database reset to fresh seed data!');
      await Promise.all([
        loadStats(),
        loadUsers()
      ]);
      if (users[0]) {
        setSelectedUserId(users[0].id);
      }
    } catch (err) {
      console.error('Failed to reset db:', err);
    } finally {
      setIsResettingDb(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Lumen Navbar */}
      <Navbar onResetDb={handleResetDb} isResetting={isResettingDb} />

      {/* Main Container */}
      <main className="main-wrapper">
        {/* Header matching Lumen CMS */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">User Trust & Reputation</h1>
          <p className="dashboard-subtitle">
            Review user trust scores, inspect positive contributions & violations, and apply reputation adjustments.
          </p>
        </div>

        {/* 4 Stat KPI Cards matching Lumen CMS */}
        <StatCards
          stats={stats}
          activeFilter={trustLevelFilter}
          onFilterSelect={handleStatCardClick}
        />

        {/* Module Split Layout: Left User Directory, Right Detailed Inspection */}
        <div className="module-layout">
          {/* Left Column: User Queue & Search */}
          <UserList
            users={users}
            selectedUserId={selectedUserId}
            onSelectUser={(id) => setSelectedUserId(id)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            trustLevelFilter={trustLevelFilter}
            onTrustLevelChange={setTrustLevelFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            loading={loadingUsers}
          />

          {/* Right Column: User Trust Score, Metrics & History Log */}
          <UserDetail
            user={selectedUser}
            history={userHistory}
            loadingDetail={loadingDetail}
            onOpenUpdateModal={() => setIsModalOpen(true)}
            onChangeStatus={handleStatusChange}
          />
        </div>
      </main>

      {/* Modal for Recording Reputation Actions */}
      <UpdateReputationModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleRecordReputation}
        isSubmitting={isSubmittingAction}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
