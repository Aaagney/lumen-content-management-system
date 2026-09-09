import { pool } from '../database/db';
import type { DashboardStats, ContentItem, ContentStatus } from '../types';

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

export async function getDashboardStats(): Promise<DashboardStats> {
  const totalResult = await pool.query('SELECT COUNT(*) as count FROM contents');
  const pendingResult = await pool.query("SELECT COUNT(*) as count FROM contents WHERE status = 'PENDING'");
  const publishedResult = await pool.query("SELECT COUNT(*) as count FROM contents WHERE status = 'PUBLISHED'");
  const rejectedResult = await pool.query("SELECT COUNT(*) as count FROM contents WHERE status = 'REJECTED'");
  const draftResult = await pool.query("SELECT COUNT(*) as count FROM contents WHERE status = 'DRAFT'");

  const recentResult = await pool.query(
    `SELECT c.*, cat.name as category_name
     FROM contents c
     LEFT JOIN categories cat ON c.category_id = cat.id
     ORDER BY c.created_at DESC
     LIMIT 5`
  );

  return {
    totalContent: parseInt(totalResult.rows[0].count, 10),
    pendingContent: parseInt(pendingResult.rows[0].count, 10),
    publishedContent: parseInt(publishedResult.rows[0].count, 10),
    rejectedContent: parseInt(rejectedResult.rows[0].count, 10),
    draftContent: parseInt(draftResult.rows[0].count, 10),
    recentContent: recentResult.rows.map(mapRow),
  };
}
