# Content Management System

A full-stack Content Management System (CMS) designed to provide a structured platform for creating, managing, discovering, discussing, and interacting with digital content.

The system supports articles, quizzes, comments, user profiles, search, private communication, author subscriptions, notifications, quiz attempts, administration, and AI-assisted content moderation.

---

## 📌 Project Overview

The Content Management System allows authors to create and submit articles and quizzes while readers can browse content, participate in discussions, subscribe to authors, communicate privately, and attempt quizzes.

Administrators can verify content, manage platform activities, review reports, and monitor moderation actions.

The updated system introduces AI-assisted moderation features to improve content safety, quality, spam detection, duplicate detection, and moderation workflows.

---

# 🚀 Features

## 1. User Management Module

Provides:

- User registration
- Login
- Authentication
- User profiles
- Account management

---

## 2. Article / Blog Module

Authors can:

- Create articles
- Edit articles
- Delete articles
- Submit articles
- Publish articles
- Manage article content

Submitted content can be passed through the moderation workflow before publication.

---

## 3. Quiz Module

Authors can:

- Add quizzes to articles
- Add questions
- Add answer options
- Define correct answers
- Manage quiz content

Associated quiz content can also be included in the content verification workflow.

---

## 4. Admin Verification Module

Administrators can:

- Review submitted articles
- Review associated quizzes
- Approve content
- Reject content
- Request changes
- Verify content before publication

---

## 5. Comment & Discussion Module

Users can:

- Comment on articles
- Reply to comments
- Participate in discussions
- Interact with other users

Comments may also be analyzed by the moderation system for spam, toxic content, inappropriate content, suspicious links, and other policy violations.

---

## 6. User Profile Module

Users can:

- View their own profile
- View other users' profiles
- View published articles
- View basic user information

Relevant reputation information can also be displayed where applicable.

---

## 7. Search Module

Users can search for:

- Articles
- Authors
- Users
- Keywords
- Categories
- Tags

---

## 8. Personal Chat Module

Users can communicate through one-to-one private chats.

Features include:

- Start a private conversation
- Send messages
- Receive messages
- View conversation history
- View timestamps
- Read/unread messages
- View recent conversations

---

## 9. Author Subscription Module

Users can:

- Subscribe to authors
- Unsubscribe from authors
- Manage their subscriptions

Subscriptions are used by the notification system for relevant author activity.

---

## 10. Notification Module

Users can receive notifications for:

- New articles from subscribed authors
- Relevant content updates
- Subscription activity
- Moderation-related actions
- Other important platform events

---

## 11. Quiz Attempt & Result Module

Readers can:

- Attempt approved quizzes
- Submit answers
- View scores
- View results
- Review quiz performance

---

# 🤖 NEW AI-POWERED FEATURES

The updated CMS introduces AI-assisted moderation and content management functionality.

---

## 12. AI Content Moderation

The system can automatically analyze submitted content for potentially unsafe or problematic material.

AI moderation can check for:

- Spam
- Toxic content
- Hate speech
- Inappropriate content
- Suspicious links
- Personally Identifiable Information (PII)

The system generates a risk score for submitted content.

### Moderation Flow

```text
Content Submitted
       ↓
AI Content Analysis
       ↓
Risk Score
       ↓
Risk Classification
```

---

## 13. Smart Content Approval

The risk score is used to determine the next moderation step.

### Low Risk

```text
Content Submitted
       ↓
AI Analysis
       ↓
Low Risk
       ↓
Auto Approve
       ↓
Publish
```

### Medium Risk

```text
Content Submitted
       ↓
AI Analysis
       ↓
Medium Risk
       ↓
Admin Review
       ↓
Approve / Reject / Request Changes
```

### High Risk

```text
Content Submitted
       ↓
AI Analysis
       ↓
High Risk
       ↓
Auto Block
       ↓
Notify Author
       ↓
Appeal if required
```

Risk thresholds should be configurable according to the project's moderation rules.

---

## 14. Spam & Abuse Detection

The system can identify suspicious activity such as:

- Repeated spam posts
- Repeated spam comments
- Suspicious links
- Unusual user activity
- Repeated violations
- Highly repetitive submissions

Depending on the configured moderation rules, suspicious activity can be:

- Flagged
- Sent for admin review
- Restricted
- Recorded in the moderation audit

---

## 15. AI Content Quality & Duplicate Detection

AI-assisted analysis can help authors improve content before submission.

### Quality Analysis

The system can check:

- Grammar
- Readability
- Content structure
- Paragraph organization
- Repeated content

### Duplicate Detection

Submitted articles can be compared with existing content to identify potentially duplicate or highly similar articles.

### Improvement Suggestions

The system can provide suggestions such as:

- Improve heading structure
- Improve readability
- Reduce unnecessary repetition
- Improve paragraph organization
- Add missing sections
- Rewrite unclear portions

---

## 16. Report & Appeal System

Users can report:

- Articles
- Comments
- Users

A report can contain:

- Reporter
- Reported content
- Reason
- Description
- Status
- Date and time

AI can assist in analyzing reported content.

Administrators can review reports and take appropriate action.

### Appeal System

Users can appeal automated blocks or rejections.

```text
Content Blocked
       ↓
Author Notified
       ↓
Author Submits Appeal
       ↓
Admin Reviews Appeal
       ↓
Final Decision
       ↓
Content Restored / Remains Blocked
```

Reports and appeals should be recorded for audit purposes.

---

## 17. User Trust & Reputation

The system can maintain a user trust or reputation score.

The reputation system may consider:

### Positive Contributions

- Approved articles
- Successful contributions
- Positive platform activity

### Violations

- Confirmed spam
- Repeated inappropriate content
- Confirmed policy violations
- Abusive activity

The reputation score is used as one factor in moderation and should not be the sole basis for an automated decision.

---

## 18. AI Moderation Dashboard & Audit

Administrators can monitor moderation activity through a dedicated dashboard.

The dashboard can show:

- Total submitted content
- Auto-approved content
- Auto-blocked content
- Admin-reviewed content
- Pending reviews
- Reports
- Appeals
- Spam detections
- Risk scores
- Moderation actions
- User violations
- Reputation information
- AI moderation history
- Admin moderation history

### Audit History

Moderation actions should record information such as:

```text
Content ID
Content Type
Risk Score
Risk Level
AI Detection Results
Action Taken
Action Source
Admin Decision
Date / Time
Appeal Status
```

This provides traceability for moderation decisions.

---

# 🔄 MAIN CONTENT MODERATION WORKFLOW

```text
                    USER SUBMITS CONTENT
                             │
                             ↓
                    AI CONTENT ANALYSIS
                             │
                             ↓
                        RISK SCORE
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
           LOW RISK      MEDIUM RISK     HIGH RISK
              │              │              │
              ↓              ↓              ↓
        AUTO APPROVE     ADMIN REVIEW    AUTO BLOCK
              │              │              │
              ↓         ┌────┴────┐         ↓
           PUBLISH      ↓         ↓     NOTIFY AUTHOR
                     APPROVE    REJECT        │
                        │         │           ↓
                        ↓         ↓        APPEAL
                     PUBLISH    BLOCK          │
                                              ↓
                                         ADMIN REVIEW
                                              │
                                              ↓
                                        FINAL DECISION
                                              │
                                              ↓
                                          AUDIT LOG
```

---

# 🧠 AI ANALYSIS FLOW

```text
Submitted Content
       ↓
Pre-processing
       ↓
AI Analysis
       │
       ├── Spam Detection
       ├── Toxicity Detection
       ├── Hate Speech Detection
       ├── Inappropriate Content Detection
       ├── PII Detection
       ├── Suspicious Link Detection
       ├── Quality Analysis
       └── Duplicate Detection
       ↓
Risk Score
       ↓
Risk Level
       ↓
Low / Medium / High
       ↓
Moderation Action
```

---

# 📊 UPDATED MODULE LIST

| Module | Main Responsibility |
|---|---|
| User Management | Registration, login, authentication and accounts |
| Article / Blog | Article creation and management |
| Quiz | Quiz and question management |
| Admin Verification | Article and quiz verification |
| Comment & Discussion | Comments and replies |
| User Profile | User profile viewing |
| Search | Search articles, authors and users |
| Personal Chat | One-to-one private messaging |
| Author Subscription | Author subscriptions |
| Notification | Platform and subscription notifications |
| Quiz Attempt & Result | Quiz attempts and scores |
| AI Content Moderation | AI content analysis and risk scoring |
| Smart Content Approval | Risk-based approval workflow |
| Spam & Abuse Detection | Spam and suspicious activity detection |
| AI Quality & Duplicate Detection | Quality and similarity analysis |
| Report & Appeal | Reports and moderation appeals |
| User Trust & Reputation | Reputation and violation tracking |
| AI Moderation Dashboard & Audit | Moderation monitoring and audit history |

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- JavaScript / JSX
- CSS
- Axios

## Backend

- Node.js
- Express.js
- REST APIs
- Controllers
- Routes

## Database

- Relational SQL database used by the existing project
- Database configuration handled through the backend

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- XAMPP / phpMyAdmin where applicable to the existing database setup

## AI Layer

The AI moderation layer can be connected to an appropriate AI service/API.

AI credentials should be stored using environment variables and must not be hard-coded into frontend code or committed to GitHub.

---

# 🏗️ HIGH-LEVEL ARCHITECTURE

```text
                         FRONTEND
                            │
                            ↓
                      React / Vite
                            │
                          Axios
                            │
                            ↓
                       REST APIs
                            │
                            ↓
                    Node.js / Express
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
        Controllers       Routes      AI Services
              │                           │
              ↓                           ↓
          Database                 AI Moderation
              │                           │
              └─────────────┬─────────────┘
                            ↓
                     CMS PLATFORM
```

---

# 🗃️ SUGGESTED MODERATION DATA

The new moderation features may require additional database entities.

## moderation_results

```text
id
content_type
content_id
risk_score
risk_level
spam_score
toxicity_score
pii_detected
suspicious_link_detected
ai_reason
created_at
```

## moderation_actions

```text
id
content_type
content_id
action
performed_by
reason
created_at
```

## reports

```text
id
reporter_id
content_type
content_id
reason
description
status
created_at
```

## appeals

```text
id
user_id
content_type
content_id
reason
status
admin_response
created_at
updated_at
```

## reputation

```text
id
user_id
trust_score
positive_actions
violations
updated_at
```

> These are suggested structures. They should be adapted to the actual database schema and relationships used by the project.

---

# 🔐 SECURITY & MODERATION PRINCIPLES

The AI moderation system is designed as an assistive moderation layer.

The system should:

- Log AI moderation decisions
- Allow administrator review
- Provide notifications for relevant moderation actions
- Support appeals for automated actions
- Maintain moderation audit history
- Protect private user information
- Restrict moderation controls to authorized users
- Avoid unnecessarily storing sensitive information
- Consider false positives
- Use reputation as one moderation factor rather than the sole decision factor

AI-generated decisions should be treated as automated assessments that may require human review.

---

# 🧪 TESTING

The system should be tested for:

## AI Moderation

- Normal content
- Spam
- Toxic content
- Hate speech
- Inappropriate content
- Suspicious links
- PII
- Duplicate content

## Smart Approval

- Low-risk content
- Medium-risk content
- High-risk content
- Admin review
- Approval
- Rejection
- Request changes

## Reports

- Article reports
- Comment reports
- User reports

## Appeals

- Submit appeal
- Admin review
- Accept appeal
- Reject appeal

## Security

- Unauthorized moderation access
- Unauthorized report access
- Unauthorized appeal access
- Invalid API requests
- Database validation
- Sensitive data protection

---

# 🌿 GIT WORKFLOW

Each module should be developed using a separate feature branch.

Example:

```bash
git checkout main
git pull origin main

git checkout -b feature/<module-name>
```

Before committing:

```bash
git status
git diff
```

Stage only the required files:

```bash
git add <required-files>
```

Commit:

```bash
git commit -m "feat: add <module-name>"
```

Push:

```bash
git push -u origin feature/<module-name>
```

Create a Pull Request for integration.

Avoid directly pushing unfinished work to `main`.

---

# 📋 PROJECT WORKFLOW SUMMARY

```text
                    USER
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
      Create       Browse     Interact
      Content      Content     with Users
          │          │          │
          ↓          ↓          ├── Comments
     AI Analysis    Search      ├── Chat
          │                     ├── Subscribe
          ↓                     └── Notifications
      Risk Score
          │
     ┌────┼────┐
     ↓    ↓    ↓
    LOW MEDIUM HIGH
     ↓    ↓    ↓
   AUTO ADMIN BLOCK
  APPROVE REVIEW
     │    │    │
     ↓    ↓    ↓
 PUBLISH  │  NOTIFY
          │    │
          │    ↓
          │  APPEAL
          │    │
          └────┴──────→ ADMIN REVIEW
                           │
                           ↓
                      FINAL DECISION
                           │
                           ↓
                       AUDIT LOG
```

---

# 👥 TEAM DEVELOPMENT

The CMS is divided into independent modules so team members can work on separate functionality while maintaining a common architecture.

Development guidelines:

- Use feature branches
- Follow the existing project structure
- Reuse existing components where appropriate
- Follow existing API conventions
- Avoid modifying unrelated modules
- Test changes before committing
- Review changed files before pushing
- Use Pull Requests for integration
- Do not commit API keys or passwords

---

# 📈 PROJECT GOALS

The updated Content Management System aims to combine:

**Content Creation**

+

**Content Discovery**

+

**Community Interaction**

+

**Private Communication**

+

**Author Subscriptions**

+

**Quizzes**

+

**AI-Assisted Moderation**

+

**Smart Content Approval**

+

**Spam & Abuse Detection**

+

**Content Quality Analysis**

+

**Reporting & Appeals**

+

**User Reputation**

+

**Moderation Auditing**

to provide a structured and safer content platform.

---

# ⭐ FINAL SYSTEM FLOW

```text
CONTENT CREATION
       ↓
CONTENT SUBMISSION
       ↓
AI MODERATION
       ↓
RISK SCORE
       ↓
SMART APPROVAL
       │
       ├── LOW → AUTO APPROVE → PUBLISH
       │
       ├── MEDIUM → ADMIN REVIEW
       │
       └── HIGH → AUTO BLOCK → NOTIFY
                                  │
                                  ↓
                               APPEAL
                                  │
                                  ↓
                            ADMIN REVIEW
                                  │
                                  ↓
                            FINAL DECISION
                                  │
                                  ↓
                             AUDIT LOG
```

---

## 📌 Project Status

The project is being developed as a modular full-stack Content Management System with AI-assisted moderation and intelligent content management capabilities.

New AI-powered functionality extends the existing CMS modules and is intended to work alongside the existing authentication, content, search, communication, subscription, notification, quiz, and administration features.
