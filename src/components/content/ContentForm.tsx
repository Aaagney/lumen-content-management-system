import { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import type { ContentFormData, ContentStatus, Category } from '@/types';

interface ContentFormProps {
  initialData?: Partial<ContentFormData>;
  categories: Category[];
  onSubmit: (data: ContentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
  draftLabel?: string;
}

const statusOptions: ContentStatus[] = ['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED'];

export default function ContentForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Submit / Publish',
  draftLabel = 'Save Draft',
}: ContentFormProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    body: initialData?.body ?? '',
    author_name: initialData?.author_name ?? '',
    category_id: initialData?.category_id ?? '',
    tags: initialData?.tags ?? [],
    status: initialData?.status ?? 'DRAFT',
  });
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.author_name.trim()) e.author_name = 'Author is required';
    if (!formData.category_id) e.category_id = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (status: ContentStatus) => {
    if (!validate()) return;
    onSubmit({ ...formData, status });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 focus:outline-none ${
              errors.title ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-400'
            }`}
            placeholder="Enter content title"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            placeholder="Short description / summary"
          />
        </div>

        {/* Body */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Content / Body</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={8}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            placeholder="Write the full content here..."
          />
        </div>

        {/* Author & Category */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 focus:outline-none ${
                errors.author_name ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-400'
              }`}
              placeholder="Author name"
            />
            {errors.author_name && <p className="mt-1 text-xs text-red-500">{errors.author_name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 focus:outline-none ${
                errors.category_id ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-400'
              }`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Tags</label>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <Tag size={16} className="text-slate-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a tag and press Enter"
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('DRAFT')}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {draftLabel}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit('PENDING')}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
