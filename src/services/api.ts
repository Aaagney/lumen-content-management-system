import { supabase } from '@/lib/supabase';
import type {
  ContentItem,
  Category,
  DashboardStats,
  ContentStatus,
  ContentFormData,
  ContentReview,
  ReviewAction,
} from '@/types';

/* ---------- Content API ---------- */

export async function getContent(params?: {
  search?: string;
  status?: string;
  category?: string;
}): Promise<ContentItem[]> {
  let query = supabase
    .from('contents')
    .select('*, categories(*)')
    .order('created_at', { ascending: false });

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,author_name.ilike.%${params.search}%`);
  }

  if (params?.status) {
    query = query.eq('status', params.status);
  }

  if (params?.category) {
    query = query.eq('categories.name', params.category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as ContentItem[];
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const { data, error } = await supabase
    .from('contents')
    .select('*, categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ContentItem | null;
}

export async function getPendingContent(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('contents')
    .select('*, categories(*)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as ContentItem[];
}

export async function getPublishedContent(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('contents')
    .select('*, categories(*)')
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as ContentItem[];
}

export async function createContent(formData: ContentFormData): Promise<ContentItem> {
  const payload = {
    title: formData.title,
    description: formData.description || null,
    body: formData.body || null,
    author_name: formData.author_name,
    category_id: formData.category_id || null,
    status: formData.status,
    tags: formData.tags,
    published_at: formData.status === 'PUBLISHED' ? new Date().toISOString() : null,
  };
  const { data, error } = await supabase
    .from('contents')
    .insert(payload)
    .select('*, categories(*)')
    .single();
  if (error) throw new Error(error.message);
  return data as ContentItem;
}

export async function updateContent(id: string, formData: Partial<ContentFormData>): Promise<ContentItem> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (formData.title !== undefined) updateData.title = formData.title;
  if (formData.description !== undefined) updateData.description = formData.description || null;
  if (formData.body !== undefined) updateData.body = formData.body || null;
  if (formData.category_id !== undefined) updateData.category_id = formData.category_id || null;
  if (formData.tags !== undefined) updateData.tags = formData.tags;
  if (formData.status !== undefined) {
    updateData.status = formData.status;
    if (formData.status === 'PUBLISHED') {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('contents')
    .update(updateData)
    .eq('id', id)
    .select('*, categories(*)')
    .single();
  if (error) throw new Error(error.message);
  return data as ContentItem;
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from('contents').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function approveContent(id: string, comment?: string): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('contents')
    .update({
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, categories(*)')
    .single();
  if (error) throw new Error(error.message);

  const { error: reviewError } = await supabase.from('content_reviews').insert({
    content_id: id,
    reviewer_name: 'Admin User',
    action: 'APPROVED',
    comment: comment || null,
  });
  if (reviewError) throw new Error(reviewError.message);

  return data as ContentItem;
}

export async function rejectContent(id: string, comment?: string): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('contents')
    .update({
      status: 'REJECTED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, categories(*)')
    .single();
  if (error) throw new Error(error.message);

  const { error: reviewError } = await supabase.from('content_reviews').insert({
    content_id: id,
    reviewer_name: 'Admin User',
    action: 'REJECTED',
    comment: comment || null,
  });
  if (reviewError) throw new Error(reviewError.message);

  return data as ContentItem;
}

export async function requestRevision(id: string, comment: string): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('contents')
    .update({
      status: 'DRAFT',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, categories(*)')
    .single();
  if (error) throw new Error(error.message);

  const { error: reviewError } = await supabase.from('content_reviews').insert({
    content_id: id,
    reviewer_name: 'Admin User',
    action: 'REQUESTED_REVISION',
    comment: comment || null,
  });
  if (reviewError) throw new Error(reviewError.message);

  return data as ContentItem;
}

export async function draftContent(id: string): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('contents')
    .update({
      status: 'DRAFT',
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, categories(*)')
    .single();
  if (error) throw new Error(error.message);
  return data as ContentItem;
}

/* ---------- Category API ---------- */

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function createCategory(name: string, description: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, description: description || null })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Category;
}

export async function updateCategory(id: string, name: string, description: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, description: description || null, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* ---------- Dashboard API ---------- */

export async function getDashboardStats(): Promise<DashboardStats> {
  const { count: totalContent, error: e1 } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true });
  if (e1) throw new Error(e1.message);

  const { count: pendingContent, error: e2 } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING');
  if (e2) throw new Error(e2.message);

  const { count: publishedContent, error: e3 } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PUBLISHED');
  if (e3) throw new Error(e3.message);

  const { count: rejectedContent, error: e4 } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'REJECTED');
  if (e4) throw new Error(e4.message);

  const { count: draftContent, error: e5 } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'DRAFT');
  if (e5) throw new Error(e5.message);

  const { data: recentContent, error: e6 } = await supabase
    .from('contents')
    .select('*, categories(*)')
    .order('created_at', { ascending: false })
    .limit(5);
  if (e6) throw new Error(e6.message);

  return {
    totalContent: totalContent ?? 0,
    pendingContent: pendingContent ?? 0,
    publishedContent: publishedContent ?? 0,
    rejectedContent: rejectedContent ?? 0,
    draftContent: draftContent ?? 0,
    recentContent: (recentContent ?? []) as ContentItem[],
  };
}

/* ---------- Review API ---------- */

export async function getReviewsByContentId(contentId: string): Promise<ContentReview[]> {
  const { data, error } = await supabase
    .from('content_reviews')
    .select('*')
    .eq('content_id', contentId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data as ContentReview[];
}

export async function getAllReviews(): Promise<(ContentReview & { content_title: string; content_status: ContentStatus })[]> {
  const { data, error } = await supabase
    .from('content_reviews')
    .select(`
      *,
      contents!inner (title, status)
    `)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row: Record<string, unknown>) => {
    const content = row.contents as { title: string; status: ContentStatus };
    return {
      id: row.id as string,
      content_id: row.content_id as string,
      reviewer_name: row.reviewer_name as string,
      action: row.action as ReviewAction,
      comment: row.comment as string | null,
      created_at: row.created_at as string,
      content_title: content.title,
      content_status: content.status,
    };
  });
}

export async function getReviewCount(): Promise<number> {
  const { count, error } = await supabase
    .from('content_reviews')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export type { ContentStatus };
