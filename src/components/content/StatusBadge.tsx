import type { ContentStatus } from '@/types';

const statusConfig: Record<
  ContentStatus,
  { label: string; classes: string; dot: string }
> = {
  DRAFT: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700 border border-slate-200',
    dot: 'bg-slate-400',
  },
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  PUBLISHED: {
    label: 'Published',
    classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
};

export default function StatusBadge({ status }: { status: ContentStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
