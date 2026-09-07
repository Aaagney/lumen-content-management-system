-- =====================================================================
-- Lumen CMS — canonical database schema
--
-- This file only creates the database and tables. It is safe to run
-- multiple times: every statement uses CREATE ... IF NOT EXISTS, and all
-- indexes are declared inline inside the CREATE TABLE statements (rather
-- than as separate CREATE INDEX statements) so re-running this file never
-- fails with a "duplicate key name" error.
--
-- Optional demo/seed data lives in seed.sql, not here — run that
-- separately, and only once, against a fresh database.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cms_db;
USE cms_db;

-- =========================
-- USERS
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('reader', 'author', 'admin') NOT NULL DEFAULT 'reader',
    avatar VARCHAR(500) DEFAULT NULL,
    bio TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CATEGORIES
-- =========================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- ARTICLES
-- =========================

CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500) DEFAULT NULL,
    content LONGTEXT NOT NULL,

    category_id INT DEFAULT NULL,
    author_id INT NOT NULL,

    cover_image VARCHAR(500) DEFAULT NULL,

    status ENUM(
        'Draft',
        'Pending Review',
        'Approved',
        'Published',
        'Rejected',
        'Changes Requested'
    ) NOT NULL DEFAULT 'Draft',

    likes_count INT DEFAULT 0,
    bookmarks_count INT DEFAULT 0,
    read_time INT DEFAULT 0,

    admin_note TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_articles_author
        FOREIGN KEY (author_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_articles_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE SET NULL,

    KEY idx_articles_author (author_id),
    KEY idx_articles_status (status),
    KEY idx_articles_category (category_id)
);

-- =========================
-- COMMENTS
-- =========================

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    article_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT DEFAULT NULL,

    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_article
        FOREIGN KEY (article_id)
        REFERENCES articles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_id)
        REFERENCES comments(id)
        ON DELETE CASCADE,

    KEY idx_comments_article (article_id),
    KEY idx_comments_user (user_id),
    KEY idx_comments_parent (parent_id)
);

-- =========================
-- NOTIFICATIONS
-- =========================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    recipient_id INT NOT NULL,

    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    related_entity_type VARCHAR(50) DEFAULT NULL,
    related_entity_id INT DEFAULT NULL,

    action_url VARCHAR(500) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    KEY idx_notifications_recipient (recipient_id),
    KEY idx_notifications_read (recipient_id, is_read)
);
