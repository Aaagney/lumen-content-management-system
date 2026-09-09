import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, FileEdit, ClipboardList } from 'lucide-react';
import { getDashboardStats, getContent, getReviewCount } from '@/services/api';
import type { DashboardStats, ContentItem } from '@/types';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApproved, setRecentApproved] = useState<ContentItem[]>([]);
  const [recentRejected, setRecentRejected] = useState<ContentItem[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, published, rejected, reviews] = await Promise.all([
          getDashboardStats(),
          getContent({ status: 'PUBLISHED' }),
          getContent({ status: 'REJECTED' }),
          getReviewCount(),
        ]);
        setStats(s);
        setRecentApproved(published.slice(0, 5));
        setRecentRejected(rejected.slice(0, 5));
        setReviewCount(reviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total Content" value={stats.totalContent} icon={FileText} accent="bg-slate-100 text-slate-700" />
        <StatCard label="Pending" value={stats.pendingContent} icon={Clock} accent="bg-amber-50 text-amber-600" />
        <StatCard label="Published" value={stats.publishedContent} icon={CheckCircle} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Rejected" value={stats.rejectedContent} icon={XCircle} accent="bg-red-50 text-red-600" />
        <StatCard label="Draft" value={stats.draftContent} icon={FileEdit} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Reviews" value={reviewCount} icon={ClipboardList} accent="bg-violet-50 text-violet-600" />
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity title="Recent Content" items={stats.recentContent} />
        </div>
        <div className="space-y-4">
          <RecentActivity title="Recently Approved" items={recentApproved} emptyMessage="No approved content." />
          <RecentActivity title="Recently Rejected" items={recentRejected} emptyMessage="No rejected content." />
        </div>
      </div>
    </div>
  );
}
