import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, RefreshCw, ClipboardList, Search, Inbox } from 'lucide-react';
import { getAllReviews } from '@/services/api';
import type { ReviewAction, ContentStatus } from '@/types';

interface ReviewRow {
  id: string;
  content_id: string;
  reviewer_name: string;
  action: ReviewAction;
  comment: string | null;
  created_at: string;
  content_title: string;
  content_status: ContentStatus;
}

const actionConfig: Record<
  ReviewAction,
  { icon: typeof Check; bg: string; text: string; label: string; border: string }
> = {
  APPROVED: { icon: Check, bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved', border: 'border-emerald-200' },
  REJECTED: { icon: X, bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected', border: 'border-red-200' },
  REQUESTED_REVISION: { icon: RefreshCw, bg: 'bg-amber-50', text: 'text-amber-700', label: 'Revision Requested', border: 'border-amber-200' },
};

const filterOptions: { value: ReviewAction | ''; label: string }[] = [
  { value: '', label: 'All Actions' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REQUESTED_REVISION', label: 'Revision Requested' },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<ReviewAction | ''>('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllReviews();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      !search ||
      r.content_title.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer_name.toLowerCase().includes(search.toLowerCase());
    const matchesAction = !actionFilter || r.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const counts = {
    total: reviews.length,
    approved: reviews.filter((r) => r.action === 'APPROVED').length,
    rejected: reviews.filter((r) => r.action === 'REJECTED').length,
    revision: reviews.filter((r) => r.action === 'REQUESTED_REVISION').length,
  };

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Reviews</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{counts.total}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-medium text-emerald-600">Approved</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{counts.approved}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
          <p className="text-xs font-medium text-red-600">Rejected</p>
          <p className="mt-1 text-xl font-bold text-red-700">{counts.rejected}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-xs font-medium text-amber-600">Revisions Requested</p>
          <p className="mt-1 text-xl font-bold text-amber-700">{counts.revision}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by content title or reviewer..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ReviewAction | '')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white py-12">
          <Inbox size={32} className="text-slate-300" />
          <p className="text-sm text-slate-400">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => {
            const config = actionConfig[review.action];
            const Icon = config.icon;
            return (
              <div
                key={review.id}
                className={`rounded-xl border ${config.border} bg-white p-4 transition-shadow hover:shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                    <Icon size={16} className={config.text} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
                      <span className="text-xs text-slate-400">
                        by {review.reviewer_name} ·{' '}
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <Link
                      to={`/content/${review.content_id}`}
                      className="mt-1 block truncate text-sm font-medium text-slate-900 hover:text-slate-600"
                    >
                      {review.content_title}
                    </Link>
                    {review.comment && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                    )}
                  </div>
                  <ClipboardList size={16} className="mt-1 hidden flex-shrink-0 text-slate-300 sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
