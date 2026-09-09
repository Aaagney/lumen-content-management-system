/*
# Create content_reviews table for the review system

1. New Tables
- `content_reviews`: Stores admin review decisions and feedback notes for content items.
  - id (uuid, primary key)
  - content_id (uuid, foreign key to contents ON DELETE CASCADE)
  - reviewer_name (text, not null — the admin who reviewed)
  - action (text, not null — values: APPROVED, REJECTED, REQUESTED_REVISION)
  - comment (text, nullable — admin feedback/note for the author)
  - created_at (timestamptz)

2. Security
- Enable RLS on content_reviews.
- Single-tenant admin demo (no sign-in screen), so allow anon + authenticated full CRUD.

3. Notes
- Each review row is a permanent audit trail entry — one row per review action.
- A content item can have multiple review rows (e.g., rejected first, then approved after edits).
- The foreign key uses ON DELETE CASCADE so reviews are cleaned up when content is deleted.
- An index on content_id supports efficient lookups of all reviews for a given content item.
*/

CREATE TABLE IF NOT EXISTS content_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('APPROVED', 'REJECTED', 'REQUESTED_REVISION')),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON content_reviews;
CREATE POLICY "anon_select_reviews" ON content_reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON content_reviews;
CREATE POLICY "anon_insert_reviews" ON content_reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON content_reviews;
CREATE POLICY "anon_update_reviews" ON content_reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON content_reviews;
CREATE POLICY "anon_delete_reviews" ON content_reviews FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_reviews_content_id ON content_reviews(content_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON content_reviews(created_at DESC);
