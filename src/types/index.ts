export type ContentStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  author_id: string | null;
  author_name: string;
  category_id: string | null;
  status: ContentStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  categories?: Category | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalContent: number;
  pendingContent: number;
  publishedContent: number;
  rejectedContent: number;
  draftContent: number;
  recentContent: ContentItem[];
}

export interface ContentFilters {
  search?: string;
  status?: ContentStatus | '';
  category?: string;
}

export interface ContentFormData {
  title: string;
  description: string;
  body: string;
  author_name: string;
  category_id: string;
  tags: string[];
  status: ContentStatus;
}

export type ReviewAction = 'APPROVED' | 'REJECTED' | 'REQUESTED_REVISION';

export interface ContentReview {
  id: string;
  content_id: string;
  reviewer_name: string;
  action: ReviewAction;
  comment: string | null;
  created_at: string;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
}
