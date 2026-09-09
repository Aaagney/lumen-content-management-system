/*
# Create CMS Categories and Contents Tables

1. New Tables
- `categories`: Stores content categories (Technology, Education, Science, etc.)
  - id (uuid, primary key)
  - name (text, unique, not null)
  - description (text, nullable)
  - created_at (timestamptz)
  - updated_at (timestamptz)
- `contents`: Stores content articles with approval workflow status
  - id (uuid, primary key)
  - title (text, not null)
  - description (text, nullable)
  - body (text, nullable)
  - author_id (uuid, nullable — for future User Profile module integration)
  - author_name (text, not null)
  - category_id (uuid, foreign key to categories)
  - status (text, not null, default 'DRAFT' — values: DRAFT, PENDING, PUBLISHED, REJECTED)
  - tags (text array, nullable)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - published_at (timestamptz, nullable)

2. Security
- Enable RLS on both tables.
- This is a single-tenant admin demo (no sign-in screen), so allow anon + authenticated full CRUD.
- The `author_id` column is nullable and reserved for future integration with the User Profile module.

3. Notes
- Status values are constrained via CHECK constraint.
- An index on `status` supports the dashboard count queries.
- A foreign key from contents.category_id to categories.id with ON DELETE SET NULL.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  body text,
  author_id uuid,
  author_name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_contents" ON contents;
CREATE POLICY "anon_select_contents" ON contents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contents" ON contents;
CREATE POLICY "anon_insert_contents" ON contents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contents" ON contents;
CREATE POLICY "anon_update_contents" ON contents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contents" ON contents;
CREATE POLICY "anon_delete_contents" ON contents FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_category_id ON contents(category_id);
