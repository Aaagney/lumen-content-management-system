import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { getContentById, getCategories, updateContent } from '@/services/api';
import type { Category, ContentFormData, ContentStatus } from '@/types';
import ContentForm from '@/components/content/ContentForm';

export default function ContentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialData, setInitialData] = useState<Partial<ContentFormData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const [item, cats] = await Promise.all([getContentById(id), getCategories()]);
        setCategories(cats);
        if (item) {
          setInitialData({
            title: item.title,
            description: item.description ?? '',
            body: item.body ?? '',
            author_name: item.author_name,
            category_id: item.category_id ?? '',
            tags: item.tags,
            status: item.status as ContentStatus,
          });
        } else {
          setError('Content not found.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (data: ContentFormData) => {
    setLoading(true);
    setError('');
    try {
      await updateContent(id!, data);
      setSuccess(true);
      setTimeout(() => navigate(`/content/${id}`), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <Check size={16} /> Content updated successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <X size={16} /> {error}
        </div>
      )}

      {initialData && (
        <ContentForm
          initialData={initialData}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/content/${id}`)}
          loading={loading}
          submitLabel="Save Changes"
          draftLabel="Save as Draft"
        />
      )}
    </div>
  );
}
