import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, FolderTree, Check, X } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/api';
import type { Category } from '@/types';
import DeleteConfirmModal from '@/components/content/DeleteConfirmModal';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateForm = () => {
    setEditingCat(null);
    setFormName('');
    setFormDesc('');
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (cat: Category) => {
    setEditingCat(cat);
    setFormName(cat.name);
    setFormDesc(cat.description ?? '');
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError('Category name is required');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, formName.trim(), formDesc.trim());
        showToast('success', 'Category updated.');
      } else {
        await createCategory(formName.trim(), formDesc.trim());
        showToast('success', 'Category created.');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      showToast('success', `"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete category');
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{categories.length} categories</p>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FolderTree size={20} />
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEditForm(cat)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{cat.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {cat.description ?? 'No description'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                {editingCat ? 'Edit Category' : 'Add Category'}
              </h3>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
                  placeholder="Short description (optional)"
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        open={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Content in this category will be uncategorized.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
