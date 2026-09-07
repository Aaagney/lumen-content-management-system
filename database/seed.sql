-- =====================================================================
-- Lumen CMS — optional demo/seed data
--
-- Not part of the schema. Run this ONLY against a fresh database, after
-- schema.sql, if you want sample users/categories/articles to develop
-- or test against. Demo password for every seeded user: Password123
--
-- Categories and users use INSERT IGNORE, so re-running this file will
-- NOT error out (duplicates by unique name/email are silently skipped).
-- The sample articles are not protected by a unique key, so re-running
-- this file will insert them again — do not run it more than once
-- against a database that already has data in it.
-- =====================================================================

USE lumen;

INSERT IGNORE INTO categories (name) VALUES
    ('Science'), ('Technology'), ('Environment'), ('Health'), ('History');

INSERT IGNORE INTO users (fullname, email, password, role, avatar, bio) VALUES
    ('Amara Silva', 'amara@lumen.com', '$2b$10$G7EUH9buYRetx9hAlZpuKuAtklxCLDxKX02XHlEbSBlfQ29SAQP.C', 'admin',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        'Senior editorial manager overseeing quality and standards.'),
    ('Priya Mehta', 'priya@lumen.com', '$2b$10$G7EUH9buYRetx9hAlZpuKuAtklxCLDxKX02XHlEbSBlfQ29SAQP.C', 'author',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        'Science communicator & neuroscientist writing about how technology shapes human biology.'),
    ('Thomas Okeke', 'thomas@lumen.com', '$2b$10$G7EUH9buYRetx9hAlZpuKuAtklxCLDxKX02XHlEbSBlfQ29SAQP.C', 'author',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        'Technology historian and computer science researcher.'),
    ('Lena Kaufmann', 'lena@lumen.com', '$2b$10$G7EUH9buYRetx9hAlZpuKuAtklxCLDxKX02XHlEbSBlfQ29SAQP.C', 'reader',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        'Avid reader and tech enthusiast.');

INSERT INTO articles (title, subtitle, content, category_id, author_id, cover_image, status, likes_count, bookmarks_count, read_time) VALUES
    ('How CRISPR is Rewriting the Story of Human Disease',
     'A silent revolution in molecular biology has produced a tool precise enough to correct a single letter in human DNA.',
     'The laboratory is a place of carefully managed micro-environments. CRISPR-Cas9, the gene editing tool, has transformed modern medicine.',
     1, 2, 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200', 'Published', 4321, 284, 7),
    ('The Night the Internet Was Born',
     'On October 29, 1969, a student typed two letters from a terminal at UCLA. The system crashed. The internet had arrived.',
     'The message was supposed to be "login", but the precursor to today''s internet crashed after typing "lo". Despite this, ARPANET was born.',
     2, 3, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200', 'Published', 2117, 182, 5),
    ('What the Ocean Is Trying to Tell Us About Carbon',
     'A draft awaiting editorial review.',
     'The ocean absorbs roughly a quarter of the carbon dioxide humans emit each year. This piece is still being polished by its author.',
     3, 2, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200', 'Pending Review', 0, 0, 6);
