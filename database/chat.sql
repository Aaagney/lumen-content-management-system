-- Create Database
CREATE DATABASE IF NOT EXISTS cms_chat_db;
USE cms_chat_db;

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Conversations Table
CREATE TABLE conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_one_id INT NOT NULL,
    user_two_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_different_users CHECK (user_one_id <> user_two_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Index to avoid duplicate lookup scans
CREATE INDEX idx_user_one ON conversations(user_one_id);
CREATE INDEX idx_user_two ON conversations(user_two_id);

-- Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_conversation ON messages(conversation_id);
CREATE INDEX idx_sender ON messages(sender_id);
CREATE INDEX idx_receiver ON messages(receiver_id);

-- ====================================================
-- DEMO INITIAL DATA (Clearly marked for immediate testing)
-- ====================================================

-- Demo Users
INSERT INTO users (id, name, email) VALUES
(1, 'Loga Shree', 'loga.shree@cms.edu'),
(2, 'Thomas Okeke', 'thomas.okeke@cms.edu'),
(3, 'Aarya Joshi', 'aarya.joshi@cms.edu'),
(4, 'David Chen', 'david.chen@cms.edu');

-- Demo Conversations
INSERT INTO conversations (id, user_one_id, user_two_id, created_at, updated_at) VALUES
(1, 1, 2, '2026-10-29 14:00:00', '2026-10-29 14:32:00'),
(2, 1, 3, '2026-10-29 13:00:00', '2026-10-29 13:20:00');

-- Demo Messages
INSERT INTO messages (id, conversation_id, sender_id, receiver_id, message, is_read, created_at) VALUES
(1, 1, 2, 1, 'Hello Loga! Have you checked the latest draft for the editorial?', TRUE, '2026-10-29 14:28:00'),
(2, 1, 1, 2, 'Yes Thomas! I am reviewing the UCLA internet article right now.', TRUE, '2026-10-29 14:30:00'),
(3, 1, 2, 1, 'Great, let me know if you need any edits on paragraph 3.', FALSE, '2026-10-29 14:32:00'),
(4, 2, 3, 1, 'Thank you for approving the article submission!', TRUE, '2026-10-29 13:20:00');