import { useEffect, useState } from 'react';
import { MessageSquare, Check, X, RefreshCw, Inbox } from 'lucide-react';
import { getReviewsByContentId } from '@/services/api';
import type { ContentReview, ReviewAction } from '@/types';

const actionStyle: Record<ReviewAction, { icon: typeof Check; bg: string; text: string; label: string }> = {
  APPROVED: { icon: Check, bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' },
  REJECTED: { icon: X, bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' },
  REQUESTED_REVISION: { icon: RefreshCw, bg: 'bg-amber-50', text: 'text-amber-700', label: 'Revision Requested' },
};

export default function ReviewPanel({ contentId }: { contentId: string }) {
  const [reviews, setReviews] = useState<ContentReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getReviewsByContentId(contentId);
        setReviews(data);
      } catch {
        // silent fail — panel is supplementary
      } finally {
        setLoading(false);
      }
    })();
  }, [contentId]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        <MessageSquare size={18} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900">Review History</h3>
        {reviews.length > 0 && (
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-50" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
          <Inbox size={28} className="text-slate-300" />
          <p className="text-sm text-slate-400">No reviews yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {reviews.map((review) => {
            const style = actionStyle[review.action];
            const Icon = style.icon;
            return (
              <div key={review.id} className="flex gap-3 p-5">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                  <Icon size={16} className={style.text} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                    <span className="text-xs text-slate-400">
                      by {review.reviewer_name} · {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
