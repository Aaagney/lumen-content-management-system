# Content Management System (CMS)

A role-based Content Management System where **Authors** create articles with quizzes, **Admins** review and approve/reject content, and **Users** browse articles and attempt quizzes. Each role has separate authentication and permissions.

## Features

- **Role-based access control** — separate auth flows for Admin, Author, and User
- **Author**
  - Upload/create articles
  - Create quiz questions (with 4 options) linked to each article
- **Admin**
  - Review uploaded articles
  - Approve or reject articles
  - Send change requests back to authors
- **User**
  - Browse published articles
  - Attempt quiz questions related to articles

## Tech Stack

| Layer    | Technology                          |
|----------|---------------------------------------|
| Frontend | React, Vite, React Router, Axios      |
| Backend  | Node.js, Express.js                   |
| Database | MongoDB (Mongoose ODM)                |

## Prerequisites

- Node.js v18+
- MongoDB (local install or MongoDB Atlas connection string)
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/username/cms-project.git
cd cms-project
```

### 2. Database Setup

Ensure MongoDB is running locally, or have a MongoDB Atlas connection string ready. No manual schema/seed step is required — Mongoose creates collections automatically on first use.

### 3. Backend Setup

```bash
cd server
npm install
cp .env.example .env   # then edit MONGO_URI, JWT_SECRET, etc.
npm run dev             # or: npm start
```

The API runs on `http://localhost:5000` by default.

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`. It talks to the API at `http://localhost:5000/api` by default — override with a `.env` file containing `VITE_API_URL=...` if needed.

## Demo Accounts

| Role   | Email                  | Password   |
|--------|--------------------------|------------|
| Admin  | admin@cms.com            | admin123   |
| Author | author@cms.com           | author123  |
| User   | user@cms.com             | user123    |

## Core Flows

**Author flow:** Login → create/upload article → add quiz (question + 4 options, one marked correct) → submit for review → track status (Pending / Approved / Rejected / Changes Requested) → if changes requested, edit and resubmit.

**Admin flow:** Login → view queue of pending articles → Approve (article goes live to Users), Reject (article discarded, author notified), or Request Changes (feedback sent to author, article held in "changes requested" state) → view all articles across statuses for auditing.

**User flow:** Login → browse approved/published articles → open an article → attempt its quiz → get score/result on submission.

## Project Structure

```
cms-project/
├── client/                # React + Vite frontend
│   ├── src/
│   └── .env
├── server/                # Express REST API
│   ├── controllers/       # Route logic for admin, author, user
│   ├── models/            # Article, Quiz, User (Mongoose) schemas
│   ├── routes/            # Role-specific API routes
│   ├── middleware/        # Auth & role-based access checks
│   ├── config/            # DB connection config
│   └── .env
├── docs/
│   └── DOCUMENTATION.md
└── README.md
```

## User Roles & Permissions

| Role   | Upload Articles | Create Quiz | Approve/Reject | Browse Articles | Attempt Quiz |
|--------|:---------------:|:-----------:|:---------------:|:----------------:|:-------------:|
| Admin  | ❌               | ❌          | ✅               | ✅               | ❌            |
| Author | ✅               | ✅          | ❌               | ✅               | ❌            |
| User   | ❌               | ❌          | ❌               | ✅               | ✅            |

## Configuration

Set these in `server/.env`:

| Variable       | Description                     | Default    |
|----------------|----------------------------------|------------|
| `PORT`         | Server port                     | 5000       |
| `MONGO_URI`    | MongoDB connection string        | —          |
| `JWT_SECRET`   | Secret key for auth tokens       | —          |
| `TOKEN_EXPIRY` | Auth token expiry duration       | 1d         |

## API Overview

| Resource | Endpoints |
|---|---|
| **Article** | `POST /api/articles` , `GET /api/articles` , `GET /api/articles/:id` , `PUT /api/articles/:id` , `DELETE /api/articles/:id` , `GET /api/articles/:articleId/quiz` |
| **Quiz** | `POST /api/quiz` , `GET /api/quiz/:id` , `PUT /api/quiz/:id` , `DELETE /api/quiz/:id` , `POST /api/quiz/:quizId/submit` |
| **User Profile** | `GET /api/profile/:id` , `PUT /api/profile/:id` , `POST /api/profile/upload-avatar` |
| **Admin Verification** | `GET /api/admin/verify/pending` , `PUT /api/admin/verify/:id/approve` , `PUT /api/admin/verify/:id/reject` |
| **Search** | `GET /api/search?query=` , `GET /api/search/articles` , `GET /api/search/authors` |
| **Personal Chat** | `POST /api/chat/send` , `GET /api/chat/:userId` , `DELETE /api/chat/:messageId` |
| **Author Subscription** | `POST /api/subscribe/:authorId` , `DELETE /api/subscribe/:authorId` , `GET /api/subscribe/status/:authorId` |
| **Admin & Content Management** | `GET /api/admin/content` , `PUT /api/admin/content/:id/approve` , `PUT /api/admin/content/:id/reject` , `PUT /api/admin/content/:id/request-changes` |
| **Integration** | `GET /api/integration/status` , `POST /api/integration/webhook` |

> Note: Article and Quiz endpoints are confirmed from actual route code. The rest are placeholder endpoints based on module names — update once real route files are shared.

## Running Tests

```bash
cd server
npm test
```

## Documentation

Detailed architecture, API endpoints, and role workflows are in [`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md).

## Module Assignments

| Module                          | Assigned To            |
|----------------------------------|-------------------------|
| Comment & Discussion Module      | Aarya Joshi             |
| User Profile Module              | Suhani Mulchandani       |
| Admin Verification               | Kaklotar Mansi           |
| Search Module                    | Priya Nayak              |
| Personal Chat Module             | Loga Shree               |
| Author Subscription Module       | Vinayak Nili             |
| Admin & Content Management Module| Kannan N                 |
| Integration Module               | Aryan Verma              |
| README and Documentation         | Mohammed Nihal Aziz      |
| Presentation                     | Safrin Shifa             |

## Notes

- Article status transitions (`pending` → `approved` / `rejected` / `changes_requested`) should be enforced server-side, not just in the UI, so a User never sees a non-approved article even via direct API calls.
- Quiz validation: every quiz question must have exactly 4 options with one marked correct — reject creation/update requests that don't meet this.
- Role checks are enforced via middleware reading the `role` claim from the JWT — a User token must never be able to hit Admin- or Author-only routes.
- This project was built for a college assignment; authentication uses JWT (see Configuration) — no third-party OAuth is in scope unless a module explicitly adds it.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.




