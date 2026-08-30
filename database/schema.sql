-- Create Database
CREATE DATABASE IF NOT EXISTS lumen_db;
USE lumen_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('reader', 'author', 'admin') DEFAULT 'reader',
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles Table (to support display on profile pages as seen in screenshots)
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  read_time VARCHAR(50) NOT NULL,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  status ENUM('Published', 'Pending Review', 'Draft') DEFAULT 'Draft',
  image_url VARCHAR(255) DEFAULT NULL,
  author_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Seed Users
-- Password is 'password123' for all accounts (Bcrypt hash: $2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K)
INSERT INTO users (id, fullname, email, password, role, bio) VALUES
(1, 'Lena Kaufmann', 'lena@lumen.com', '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K', 'reader', 'Curious reader. Lover of long-form nonfiction.'),
(2, 'Priya Mehta', 'priya@lumen.com', '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K', 'author', 'Science communicator and molecular biologist. Writing about the invisible world.'),
(3, 'Thomas Okeke', 'thomas@lumen.com', '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K', 'author', 'Tech journalist and AI policy researcher. Unpacking digital futures.'),
(4, 'Amara Silva', 'amara@lumen.com', '$2a$10$CklCHLag7OoFay8GMAGn.O5RSU4V04PrUZGpljPFitGLt8Fovd/.K', 'admin', 'Editor-in-chief at Lumen. Overseeing quality and authenticity.');

-- Insert Seed Articles
INSERT INTO articles (id, title, category, read_time, views, likes, status, image_url, author_id) VALUES
(1, 'How CRISPR Is Rewriting the Story of Human Disease', 'Science', '7 min', 4821, 284, 'Published', 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=600&q=80', 2),
(2, 'What the Ocean Is Trying to Tell Us About Carbon', 'Environment', '8 min', 1205, 94, 'Pending Review', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', 2),
(3, 'The Quantum Computing Race: Hype vs Reality', 'Technology', '10 min', 3421, 153, 'Published', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', 3);
