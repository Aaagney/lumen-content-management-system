import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { getPublishedContent, deleteContent } from '@/services/api';
import type { ContentItem } from '@/types';
import ContentTable from '@/components/content/ContentTable';
import DeleteConfirmModal from '@/components/content/DeleteConfirmModal';

export default function Published() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPublished = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPublishedContent();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load published content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublished();
  }, [fetchPublished]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContent(deleteTarget.id);
      showToast('success', `"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchPublished();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

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

      <p className="text-sm text-slate-500">
        {items.length} published item{items.length !== 1 ? 's' : ''}
      </p>

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
        onApprove={() => {}}
        onReject={() => {}}
        onDelete={setDeleteTarget}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        title="Delete Content"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
