import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Pencil, Trash2, RefreshCw } from 'lucide-react';
import {
  getContentById,
  getCategories,
  approveContent,
  rejectContent,
  requestRevision,
  deleteContent,
} from '@/services/api';
import type { ContentItem, Category, ReviewAction } from '@/types';
import StatusBadge from '@/components/content/StatusBadge';
import DeleteConfirmModal from '@/components/content/DeleteConfirmModal';
import ReviewDecisionModal from '@/components/content/ReviewDecisionModal';
import ReviewPanel from '@/components/content/ReviewPanel';

export default function ContentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const [data, cats] = await Promise.all([getContentById(id), getCategories()]);
        setItem(data);
        setCategories(cats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-700">{error || 'Content not found.'}</p>
          <Link to="/content" className="mt-3 inline-block text-sm text-slate-600 underline">
            Back to Content
          </Link>
        </div>
      </div>
    );
  }

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReview = async (comment: string) => {
    if (!reviewAction) return;
    setReviewLoading(true);
    try {
      if (reviewAction === 'APPROVED') {
        const updated = await approveContent(item.id, comment);
        setItem(updated);
        showToast('success', 'Content approved and published.');
      } else if (reviewAction === 'REJECTED') {
        const updated = await rejectContent(item.id, comment);
        setItem(updated);
        showToast('success', 'Content rejected.');
      } else if (reviewAction === 'REQUESTED_REVISION') {
        const updated = await requestRevision(item.id, comment);
        setItem(updated);
        showToast('success', 'Revision requested. Content sent back to draft.');
      }
      setReviewAction(null);
      setReviewRefreshKey((k) => k + 1);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to process review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContent(item.id);
      navigate('/content');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const categoryName = categories.find((c) => c.id === item.category_id)?.name ?? 'Uncategorized';
  const canReview = item.status === 'PENDING' || item.status === 'PUBLISHED' || item.status === 'REJECTED';

  const reviewModalTitle =
    reviewAction === 'APPROVED'
      ? 'Approve & Publish Content'
      : reviewAction === 'REJECTED'
      ? 'Reject Content'
      : 'Request Revision';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {toast && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to="/content"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} /> Back to Content
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {canReview && (
            <>
              {item.status !== 'PUBLISHED' && (
                <button
                  onClick={() => setReviewAction('APPROVED')}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Check size={16} /> Approve
                </button>
              )}
              {item.status !== 'REJECTED' && (
                <button
                  onClick={() => setReviewAction('REJECTED')}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <X size={16} /> Reject
                </button>
              )}
              {item.status === 'PENDING' && (
                <button
                  onClick={() => setReviewAction('REQUESTED_REVISION')}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  <RefreshCw size={16} /> Request Revision
                </button>
              )}
            </>
          )}
          <button
            onClick={() => navigate(`/content/${item.id}/edit`)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={16} /> Edit
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <StatusBadge status={item.status} />
          <span className="text-sm text-slate-400">{categoryName}</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
        <p className="mt-2 text-sm text-slate-500">
          by {item.author_name} · Created {new Date(item.created_at).toLocaleDateString()}
          {item.published_at && ` · Published ${new Date(item.published_at).toLocaleDateString()}`}
        </p>

        {item.description && (
          <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{item.description}</p>
        )}

        {item.body && (
          <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {item.body}
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Review History */}
      <ReviewPanel key={reviewRefreshKey} contentId={item.id} />

      <DeleteConfirmModal
        open={showDelete}
        title="Delete Content"
        message={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleting}
      />

      {reviewAction && (
        <ReviewDecisionModal
          open={!!reviewAction}
          title={reviewModalTitle}
          contentTitle={item.title}
          action={reviewAction}
          onConfirm={handleReview}
          onCancel={() => setReviewAction(null)}
          loading={reviewLoading}
        />
      )}
    </div>
  );
}
