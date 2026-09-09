import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ContentItem } from '@/types';
import StatusBadge from '@/components/content/StatusBadge';

interface RecentActivityProps {
  title: string;
  items: ContentItem[];
  emptyMessage?: string;
}

export default function RecentActivity({
  title,
  items,
  emptyMessage = 'No items yet.',
}: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.author_name} ·{' '}
                  {item.categories?.name ?? 'Uncategorized'} ·{' '}
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="ml-3 flex items-center gap-2">
                <StatusBadge status={item.status} />
                <ArrowRight size={14} className="text-slate-300" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
