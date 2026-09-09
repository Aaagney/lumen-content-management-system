import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, RefreshCw } from 'lucide-react';
import {
  getPendingContent,
  approveContent,
  rejectContent,
  requestRevision,
  deleteContent,
} from '@/services/api';
import type { ContentItem, ReviewAction } from '@/types';
import ContentTable from '@/components/content/ContentTable';
import DeleteConfirmModal from '@/components/content/DeleteConfirmModal';
import ReviewDecisionModal from '@/components/content/ReviewDecisionModal';

export default function Pending() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ContentItem | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPendingContent();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const openReview = (item: ContentItem, action: ReviewAction) => {
    setReviewTarget(item);
    setReviewAction(action);
  };

  const handleReview = async (comment: string) => {
    if (!reviewTarget || !reviewAction) return;
    setReviewLoading(true);
    try {
      if (reviewAction === 'APPROVED') {
        await approveContent(reviewTarget.id, comment);
        showToast('success', `"${reviewTarget.title}" approved and published.`);
      } else if (reviewAction === 'REJECTED') {
        await rejectContent(reviewTarget.id, comment);
        showToast('success', `"${reviewTarget.title}" rejected.`);
      } else if (reviewAction === 'REQUESTED_REVISION') {
        await requestRevision(reviewTarget.id, comment);
        showToast('success', `"${reviewTarget.title}" sent back for revision.`);
      }
      setReviewTarget(null);
      setReviewAction(null);
      fetchPending();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to process review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContent(deleteTarget.id);
      showToast('success', `"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchPending();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const reviewModalTitle =
    reviewAction === 'APPROVED'
      ? 'Approve & Publish Content'
      : reviewAction === 'REJECTED'
      ? 'Reject Content'
      : 'Request Revision';

  return (
    <div className="space-y-4">
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

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-slate-500">
          {items.length} pending item{items.length !== 1 ? 's' : ''} awaiting approval
        </p>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => items.forEach((item) => openReview(item, 'APPROVED'))}
            disabled={items.length === 0}
            className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40 sm:flex"
          >
            <Check size={14} /> Quick Review All
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <ContentTable
        items={items}
        loading={loading}
        onView={(item) => navigate(`/content/${item.id}`)}
        onEdit={(item) => navigate(`/content/${item.id}/edit`)}
        onApprove={(item) => openReview(item, 'APPROVED')}
        onReject={(item) => openReview(item, 'REJECTED')}
        onDelete={setDeleteTarget}
      />

      {items.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => openReview(items[0], 'REQUESTED_REVISION')}
            className="flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
          >
            <RefreshCw size={16} /> Request Revision on Latest
          </button>
        </div>
      )}

      <DeleteConfirmModal
        open={!!deleteTarget}
        title="Delete Content"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {reviewTarget && reviewAction && (
        <ReviewDecisionModal
          open={!!reviewTarget}
          title={reviewModalTitle}
          contentTitle={reviewTarget.title}
          action={reviewAction}
          onConfirm={handleReview}
          onCancel={() => {
            setReviewTarget(null);
            setReviewAction(null);
          }}
          loading={reviewLoading}
        />
      )}
    </div>
  );
}
