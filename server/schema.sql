CREATE DATABASE IF NOT EXISTS cms_db;
USE cms_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role ENUM('author', 'admin', 'reader') DEFAULT 'author',
  avatar VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  content TEXT NOT NULL,
  category_id INT,
  author_id INT,
  cover_image VARCHAR(500),
  status ENUM('Draft', 'Pending Review', 'Approved', 'Published', 'Rejected', 'Changes Requested') DEFAULT 'Draft',
  likes_count INT DEFAULT 0,
  bookmarks_count INT DEFAULT 0,
  read_time VARCHAR(20) DEFAULT '5 min read',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Seed Initial Data
INSERT INTO users (name, role, avatar, bio) VALUES
('Priya Mehta', 'author', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Science communicator & neuroscientist writing about how technology shapes human biology.'),
('Thomas Okeke', 'author', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Technology historian and computer science researcher.'),
('Amara Silva', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Senior editorial manager overseeing quality and standards.'),
('Lena Kaufmann', 'reader', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'Avid reader and tech enthusiast.');

INSERT INTO categories (name) VALUES ('Science'), ('Technology'), ('Environment'), ('Health'), ('History');

INSERT INTO articles (title, subtitle, content, category_id, author_id, cover_image, status, likes_count, bookmarks_count, read_time) VALUES
('How CRISPR is Rewriting the Story of Human Disease', 
 'A silent revolution in molecular biology has produced a tool precise enough to correct a single letter in human DNA.',
 'The laboratory is a place of carefully managed micro-environments. For Priya Mehta, moving a pipette from container to container is second nature. But today, she is looking at something that could change everything...\n\nCRISPR-Cas9, the gene editing tool, has transformed modern medicine.',
 1, 1, 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200', 'Published', 4321, 284, '7 min read'),
('The Night the Internet Was Born — and Almost Wasn''t',
 'On October 29, 1969, a student typed two letters from a terminal at UCLA. The system crashed. The internet had arrived.',
 'The message was supposed to be "login", but at 10:30 PM, 1969, the precursor to today''s internet crashed after typing "lo". Despite this, ARPANET was born.',
 2, 2, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200', 'Published', 2117, 182, '5 min read');

-- ============================================================
-- Notification Module (Aryan Verma)
-- Additive only -- does not modify any existing table above.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_type VARCHAR(50),
  related_entity_id INT,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
