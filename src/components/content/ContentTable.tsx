import { Eye, Pencil, Check, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ContentItem } from '@/types';
import StatusBadge from './StatusBadge';

interface ContentTableProps {
  items: ContentItem[];
  loading: boolean;
  onView: (item: ContentItem) => void;
  onEdit: (item: ContentItem) => void;
  onApprove: (item: ContentItem) => void;
  onReject: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
}

export default function ContentTable({
  items,
  loading,
  onView,
  onEdit,
  onApprove,
  onReject,
  onDelete,
}: ContentTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-4 flex-1 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="h-4 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-slate-500">No content found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Author</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-900">
                  <Link to={`/content/${item.id}`} className="hover:text-slate-600">
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.author_name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {item.categories?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(item.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(item)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(item)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    {item.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onApprove(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onReject(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(item)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
