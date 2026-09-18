# IMS Smart Mail Hub

### AI-Powered Email Management & Task Extraction System

[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

---

## Overview

**IMS Smart Mail Hub** is an intelligent email management system designed to help students organize college-related emails and convert important information into actionable tasks.

The application connects with Gmail, processes incoming emails using an AI-powered classification pipeline, extracts important information such as category, urgency, deadlines and tasks, and presents the results through a centralized React dashboard.

---

## Key Features

- Gmail integration using OAuth 2.0
- Automatic email synchronization
- AI-powered email classification using Google Gemini
- Email category detection
- Urgency detection
- AI-generated email summaries
- Actionable task extraction
- Deadline extraction
- Task priority assignment
- AI confidence scoring
- Sender role identification
- Duplicate/processed email handling
- HTML email cleaning
- Task status management
- Task deadline collision detection
- Workload analytics
- Email and task statistics
- React dashboard

---

## Email Processing Pipeline

```text
                         Gmail
                           |
                           v
                    Gmail OAuth 2.0
                           |
                           v
                    Email Synchronization
                           |
                           v
                     HTML Cleaning
                           |
                           v
                    Gemini AI Analysis
                           |
              +------------+------------+
              |            |            |
              v            v            v
          Category      Urgency      Summary
              |            |            |
              +------------+------------+
                           |
                           v
                    Task Extraction
                           |
              +------------+------------+
              |            |            |
              v            v            v
          Task Title   Deadline     Priority
              |            |            |
              +------------+------------+
                           |
                           v
                   Confidence Scoring
                           |
                           v
                     MySQL Database
                           |
                           v
                    React Dashboard
```

---

## AI Processing

The system uses **Google Gemini** to analyze email content and return structured information.

For each email, the AI processing pipeline can determine:

- Email category
- Urgency
- Summary
- Sender role
- Actionable tasks
- Task priority
- Deadline
- Confidence scores
- Recommended application module

### Email Categories

The current classification system supports:

| Category | Description |
|---|---|
| `exam` | Exams, CATs, hall tickets, timetables and results |
| `assign` | Assignments, projects and submissions |
| `club` | Events, workshops, seminars, competitions and club activities |
| `circular` | Official notices and academic announcements |
| `fee` | Tuition, hostel, bus fees and related payments |
| `placement` | Recruitment, internships and placement activities |
| `holiday` | College holidays and closures |
| `general` | Non-college or general emails |

---

## Task Extraction

Important actions found inside emails are converted into structured tasks.

Example:

```text
Email
  |
  v
"Submit the assignment before January 17"
  |
  v
AI Extraction
  |
  +-- Task: Submit the assignment
  +-- Priority: HIGH
  +-- Deadline: January 17
  +-- Confidence: ...
```

Tasks contain information such as:

- Title
- Priority
- Deadline
- Confidence score
- Task intent confidence
- Deadline confidence
- Priority reasoning confidence
- Category confidence
- Sender authority confidence
- Status
- Related email

---

## Gmail Integration

The application uses Gmail OAuth 2.0 to connect to a user's Gmail account.

The synchronization flow is:

```text
Connect Gmail
      |
      v
OAuth Authorization
      |
      v
Access / Refresh Tokens
      |
      v
Fetch Unread Emails
      |
      v
Process Emails
      |
      v
Store Results
```

The application refreshes the Gmail access token when required and processes unread messages.

---

## Dashboard

The React frontend provides a centralized interface for:

- Viewing processed emails
- Filtering emails by category
- Viewing urgent emails
- Searching email content
- Reviewing extracted tasks
- Updating task status
- Managing task priority
- Viewing deadlines
- Viewing workload information
- Viewing processing statistics
- Checking Gmail connection status

---

## Workload Analytics

The backend provides workload-related analytics based on extracted tasks.

The dashboard can display:

- Upcoming tasks
- Tasks by day
- Deadline collisions
- Total processed emails
- Urgent emails
- Total extracted tasks
- Estimated time saved

---

## Architecture

### Backend

The backend is built using **Spring Boot 3.5** and Java 21.

Main layers include:

```text
Controller
    |
    v
Service
    |
    v
Repository
    |
    v
MySQL
```

### Frontend

The frontend is built using:

- React
- Vite
- JavaScript
- Zustand
- Axios
- React Router

---

## Technology Stack

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- Maven

### AI

- Google Gemini API
- Structured JSON extraction
- AI confidence scoring

### Gmail & Google APIs

- Gmail API
- Google OAuth 2.0
- Google Calendar API

### Database

- MySQL
- Flyway
- Hibernate / JPA

### Email Processing

- Jsoup
- HTML cleaning and text extraction

### Frontend

- React
- Vite
- Zustand
- Axios
- React Router

---

## Project Structure

```text
ims-mailhub/
│
├── backend/
│   └── mailhub/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/ims/mailhub/
│       │   │   │   ├── config/
│       │   │   │   ├── controller/
│       │   │   │   ├── dto/
│       │   │   │   ├── model/
│       │   │   │   ├── repository/
│       │   │   │   └── service/
│       │   │   │
│       │   │   └── resources/
│       │   │       ├── db/migration/
│       │   │       └── application.properties.example
│       │   │
│       │   └── test/
│       │
│       ├── pom.xml
│       └── mvnw
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

---

## API

### Email APIs

```http
GET /api/emails
```

Retrieve emails with optional category and unread filters.

```http
POST /api/emails/extract-manual
```

Process an email manually.

```http
POST /api/emails/sync
```

Synchronize unread emails from Gmail.

```http
PUT /api/emails/{id}/read
```

Toggle an email's read status.

---

### Task APIs

```http
GET /api/tasks
```

Retrieve tasks with optional priority and status filters.

```http
PUT /api/tasks/{id}
```

Update a task.

```http
POST /api/tasks/{id}/approve
```

Approve an extracted task.

```http
POST /api/tasks/{id}/push
```

Mark a task as synchronized to an external platform.

---

### Analytics APIs

```http
GET /api/emails/analytics/summary
```

Returns email and task statistics.

```http
GET /api/emails/analytics/workload
```

Returns workload information for upcoming days.

```http
GET /api/emails/analytics/timesaved
```

Returns email-processing and estimated time-saving statistics.

---

### Gmail OAuth

```http
GET /oauth2/authorize
```

Starts Gmail authorization.

```http
GET /oauth2/callback
```

Handles the OAuth callback.

```http
GET /oauth2/status
```

Checks the Gmail connection status.

---

### Health Check

```http
GET /api/emails/health
```

Returns the application health status.

---

## Installation

### Requirements

- Java 21
- Maven
- Node.js
- MySQL
- Gmail API credentials
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/GSSanjaykumar/ims-mailhub.git
cd ims-mailhub
```

### 2. Database

Create a MySQL database:

```sql
CREATE DATABASE ims_mailhub;
```

The project uses Flyway for database migrations.

### 3. Backend Configuration

Navigate to:

```text
backend/mailhub/src/main/resources/
```

Copy:

```text
application.properties.example
```

to:

```text
application.properties
```

Configure:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ims_mailhub
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

gemini.api.key=YOUR_GEMINI_API_KEY

gmail.client.id=YOUR_GMAIL_CLIENT_ID
gmail.client.secret=YOUR_GMAIL_CLIENT_SECRET

jwt.secret=YOUR_JWT_SECRET
```

Do not commit real credentials or API keys.

### 4. Run Backend

```bash
cd backend/mailhub
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

### 5. Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## Security

The project uses:

- Gmail OAuth 2.0
- JWT configuration
- Database-backed user information
- Environment-specific configuration

Sensitive configuration should remain outside the repository.

Never commit:

```text
API keys
OAuth client secrets
Gmail tokens
JWT secrets
Database passwords
```

---

## Project Status

**Active Development**

### Current

- [x] Spring Boot backend
- [x] React frontend
- [x] MySQL database integration
- [x] Gmail OAuth integration
- [x] Gmail email synchronization
- [x] Gemini AI email classification
- [x] Email categorization
- [x] Urgency detection
- [x] AI summaries
- [x] Task extraction
- [x] Deadline extraction
- [x] Task priority
- [x] Confidence scoring
- [x] Task management
- [x] Workload analytics
- [x] Email statistics

### Planned

- [ ] Additional external task/calendar integrations
- [ ] Improved authentication and multi-user support
- [ ] More advanced email intelligence
- [ ] Improved task scheduling
- [ ] Additional analytics

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Author

**Sanjay**

B.E. Computer Science and Engineering (AI & ML)  
Rajalakshmi Institute of Technology
