import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, X } from 'lucide-react';
import { getContent, getCategories, approveContent, rejectContent, deleteContent } from '@/services/api';
import type { ContentItem, Category, ContentStatus } from '@/types';
import ContentTable from '@/components/content/ContentTable';
import ContentFilters from '@/components/content/ContentFilters';
import DeleteConfirmModal from '@/components/content/DeleteConfirmModal';

export default function Content() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContentStatus | ''>('');
  const [category, setCategory] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getContent({
        search: search || undefined,
        status: status || undefined,
        category: category || undefined,
      });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [search, status, category]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch {
        // categories will just be empty
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchContent(), 300);
    return () => clearTimeout(timer);
  }, [fetchContent]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (item: ContentItem) => {
    try {
      await approveContent(item.id);
      showToast('success', `"${item.title}" approved and published.`);
      fetchContent();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to approve content');
    }
  };

  const handleReject = async (item: ContentItem) => {
    try {
      await rejectContent(item.id);
      showToast('success', `"${item.title}" rejected.`);
      fetchContent();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to reject content');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContent(deleteTarget.id);
      showToast('success', `"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchContent();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete content');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className={`fixed right-6 top-20 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {items.length} item{items.length !== 1 ? 's' : ''} total
        </p>
        <button
          onClick={() => navigate('/content/new')}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={16} /> New Content
        </button>
      </div>

      <ContentFilters
        search={search}
        status={status}
        category={category}
        categories={categories}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
      />

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
        onApprove={handleApprove}
        onReject={handleReject}
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
