import { pool } from '../database/db';
import type { Category } from '../types';

function mapRow(row: Record<string, unknown>): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows.map(mapRow);
}

export async function createCategory(name: string, description: string): Promise<Category> {
  const result = await pool.query(
    'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
    [name, description || null]
  );
  return mapRow(result.rows[0]);
}

export async function updateCategory(id: string, name: string, description: string): Promise<Category | null> {
  const result = await pool.query(
    'UPDATE categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [name, description || null, id]
  );
  if (result.rows.length === 0) return null;
  return mapRow(result.rows[0]);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
