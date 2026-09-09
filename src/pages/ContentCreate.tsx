import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { getCategories, createContent } from '@/services/api';
import type { Category, ContentFormData } from '@/types';
import ContentForm from '@/components/content/ContentForm';

export default function ContentCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      }
    })();
  }, []);

  const handleSubmit = async (data: ContentFormData) => {
    setLoading(true);
    setError('');
    try {
      await createContent(data);
      setSuccess(true);
      setTimeout(() => navigate('/content'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <Check size={16} /> Content created successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <X size={16} /> {error}
        </div>
      )}

      <ContentForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/content')}
        loading={loading}
      />
    </div>
  );
}
