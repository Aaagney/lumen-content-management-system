import { pool } from '../database/db';
import type { ContentItem, ContentFormData, ContentStatus } from '../types';

function mapRow(row: Record<string, unknown>): ContentItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    body: row.body,
    author_id: row.author_id,
    author_name: row.author_name,
    category_id: row.category_id,
    status: row.status as ContentStatus,
    tags: row.tags || [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: row.published_at,
    category_name: row.category_name || null,
  };
}

export async function getAllContent(filters: {
  search?: string;
  status?: string;
  category?: string;
}): Promise<ContentItem[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.search) {
    conditions.push(`(c.title ILIKE $${paramIndex} OR c.author_name ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.status) {
    conditions.push(`c.status = $${paramIndex}`);
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.category) {
    conditions.push(`cat.name = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT c.*, cat.name as category_name
    FROM contents c
    LEFT JOIN categories cat ON c.category_id = cat.id
    ${whereClause}
    ORDER BY c.created_at DESC
  `;

  const result = await pool.query(query, params);
  return result.rows.map(mapRow);
}

export async function getContentById(id: string): Promise<ContentItem | null> {
  const result = await pool.query(
    `SELECT c.*, cat.name as category_name
     FROM contents c
     LEFT JOIN categories cat ON c.category_id = cat.id
     WHERE c.id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function getPendingContent(): Promise<ContentItem[]> {
  const result = await pool.query(
    `SELECT c.*, cat.name as category_name
     FROM contents c
     LEFT JOIN categories cat ON c.category_id = cat.id
     WHERE c.status = 'PENDING'
     ORDER BY c.created_at DESC`
  );
  return result.rows.map(mapRow);
}

export async function getPublishedContent(): Promise<ContentItem[]> {
  const result = await pool.query(
    `SELECT c.*, cat.name as category_name
     FROM contents c
     LEFT JOIN categories cat ON c.category_id = cat.id
     WHERE c.status = 'PUBLISHED'
     ORDER BY c.published_at DESC`
  );
  return result.rows.map(mapRow);
}

export async function createContent(data: ContentFormData): Promise<ContentItem> {
  const publishedAt = data.status === 'PUBLISHED' ? new Date() : null;
  const result = await pool.query(
    `INSERT INTO contents (title, description, body, author_name, category_id, status, tags, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.title,
      data.description || null,
      data.body || null,
      data.author_name,
      data.category_id || null,
      data.status,
      data.tags || [],
      publishedAt,
    ]
  );

  const created = mapRow(result.rows[0]);
  if (data.category_id) {
    const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [data.category_id]);
    created.category_name = catResult.rows[0]?.name || null;
  }
  return created;
}

export async function updateContent(id: string, data: Partial<ContentFormData>): Promise<ContentItem | null> {
  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    params.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    params.push(data.description || null);
  }
  if (data.body !== undefined) {
    fields.push(`body = $${paramIndex++}`);
    params.push(data.body || null);
  }
  if (data.category_id !== undefined) {
    fields.push(`category_id = $${paramIndex++}`);
    params.push(data.category_id || null);
  }
  if (data.tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    params.push(data.tags);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    params.push(data.status);
    if (data.status === 'PUBLISHED') {
      fields.push(`published_at = $${paramIndex++}`);
      params.push(new Date());
    }
  }

  fields.push(`updated_at = $${paramIndex++}`);
  params.push(new Date());
  params.push(id);

  const query = `UPDATE contents SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query(query, params);

  if (result.rows.length === 0) return null;
  const updated = mapRow(result.rows[0]);
  if (updated.category_id) {
    const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [updated.category_id]);
    updated.category_name = catResult.rows[0]?.name || null;
  }
  return updated;
}

export async function approveContent(id: string): Promise<ContentItem | null> {
  const result = await pool.query(
    `UPDATE contents SET status = 'PUBLISHED', published_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function rejectContent(id: string): Promise<ContentItem | null> {
  const result = await pool.query(
    `UPDATE contents SET status = 'REJECTED', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function draftContent(id: string): Promise<ContentItem | null> {
  const result = await pool.query(
    `UPDATE contents SET status = 'DRAFT', published_at = NULL, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function deleteContent(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM contents WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
