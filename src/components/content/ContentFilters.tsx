import { Search, Filter } from 'lucide-react';
import type { ContentStatus } from '@/types';
import type { Category } from '@/types';

interface ContentFiltersProps {
  search: string;
  status: ContentStatus | '';
  category: string;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ContentStatus | '') => void;
  onCategoryChange: (value: string) => void;
}

const statusOptions: { value: ContentStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function ContentFilters({
  search,
  status,
  category,
  categories,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: ContentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or author..."
          className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter size={16} className="text-slate-400" />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as ContentStatus | '')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
