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
  category_name?: string | null;
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

export interface ContentFormData {
  title: string;
  description?: string;
  body?: string;
  author_name: string;
  category_id?: string;
  tags?: string[];
  status: ContentStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
