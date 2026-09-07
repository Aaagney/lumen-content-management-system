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
        ON DELETE SET NULL
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
        ON DELETE CASCADE
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
        ON DELETE CASCADE
);

-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_articles_author
    ON articles(author_id);

CREATE INDEX idx_articles_status
    ON articles(status);

CREATE INDEX idx_articles_category
    ON articles(category_id);

CREATE INDEX idx_comments_article
    ON comments(article_id);

CREATE INDEX idx_comments_user
    ON comments(user_id);

CREATE INDEX idx_comments_parent
    ON comments(parent_id);

CREATE INDEX idx_notifications_recipient
    ON notifications(recipient_id);

CREATE INDEX idx_notifications_read
    ON notifications(recipient_id, is_read);