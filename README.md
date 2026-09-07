# lumen-content-management-system

A complete full-stack web application built with a React frontend, Express/Node.js backend, and a MySQL relational database. Features article authoring, user profile views, dynamic client-side routing, and interactive commentary.

## Tech Stack
* **Frontend**: React, React Router, Axios, Vite
* **Backend**: Node.js, Express.js
* **Database**: MySQL

## Prerequisites
* Node.js installed on your system
* MySQL Server and MySQL Workbench configured locally

## 1. Database Setup
Open MySQL Workbench, create the database, and execute the following schema initialization script:

```sql
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
  subtitle TEXT,
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

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

```

## 2. Environment Configuration

Create a `.env` file directly inside your `server/` folder and configure your local database credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cms_db
DB_PORT=3307 

```

## 3. Installation & Running Instructions

### Backend Server Setup

Open your terminal, navigate to the server folder, install dependencies, and start the development server using nodemon:

```bash
cd server
npm install
npm run dev

```

### Frontend Client Setup

Open a second terminal window, navigate to the client folder, install dependencies, and launch the Vite development server:

```bash
cd client
npm install
npm run dev

```

Open your browser and navigate to the local development URL provided by Vite (typically `http://localhost:5173`) to interact with the application.

