import { useState } from 'react';
import { Check, X, RefreshCw, AlertTriangle } from 'lucide-react';
import type { ReviewAction } from '@/types';

interface ReviewDecisionModalProps {
  open: boolean;
  title: string;
  contentTitle: string;
  action: ReviewAction;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

const actionConfig: Record<
  ReviewAction,
  { label: string; labelGerund: string; color: string; icon: typeof Check; iconColor: string }
> = {
  APPROVED: {
    label: 'Approve',
    labelGerund: 'Approving',
    color: 'bg-emerald-600 hover:bg-emerald-700',
    icon: Check,
    iconColor: 'text-emerald-600 bg-emerald-50',
  },
  REJECTED: {
    label: 'Reject',
    labelGerund: 'Rejecting',
    color: 'bg-red-600 hover:bg-red-700',
    icon: X,
    iconColor: 'text-red-600 bg-red-50',
  },
  REQUESTED_REVISION: {
    label: 'Request Revision',
    labelGerund: 'Requesting revision',
    color: 'bg-amber-600 hover:bg-amber-700',
    icon: RefreshCw,
    iconColor: 'text-amber-600 bg-amber-50',
  },
};

export default function ReviewDecisionModal({
  open,
  title,
  contentTitle,
  action,
  onConfirm,
  onCancel,
  loading = false,
}: ReviewDecisionModalProps) {
  const [comment, setComment] = useState('');
  if (!open) return null;

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-100 p-6 pb-4">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.iconColor}`}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              You are about to {config.label.toLowerCase()} <span className="font-medium text-slate-700">"{contentTitle}"</span>
            </p>
          </div>
        </div>

        <div className="p-6 pt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Review Comment {action === 'REQUESTED_REVISION' && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            autoFocus
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
            placeholder={
              action === 'APPROVED'
                ? 'Optional: Add feedback for the author...'
                : action === 'REJECTED'
                ? 'Explain why this content is being rejected...'
                : 'Describe what revisions are needed before this can be approved...'
            }
          />
          {action !== 'APPROVED' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <AlertTriangle size={12} />
              {action === 'REQUESTED_REVISION' ? 'A comment is required when requesting revisions.' : 'Providing a reason helps the author improve.'}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(comment.trim())}
            disabled={loading || (action === 'REQUESTED_REVISION' && !comment.trim())}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${config.color}`}
          >
            {loading ? `${config.labelGerund}...` : config.label}
          </button>
        </div>
      </div>
    </div>
  );
}
