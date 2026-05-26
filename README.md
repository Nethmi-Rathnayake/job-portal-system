# 🚀 JobPortal System
### Full-Stack Job Portal Web Application
> A professional LinkedIn/TopJobs-style job portal built with React.js, PHP REST API, and MySQL.

![JobPortal](https://img.shields.io/badge/Version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18.2-61DAFB) ![PHP](https://img.shields.io/badge/PHP-8.2-777BB4) ![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Security](#security)
- [Author](#author)

---

## 🌟 Overview

JobPortal is a full-stack web application that connects job seekers with employers. It features three distinct roles — **Students**, **Companies**, and **Admins** — each with their own dashboard and capabilities.

Built as a portfolio project to demonstrate:
- Full-stack development skills
- REST API design
- JWT Authentication
- Role-based access control
- File upload handling
- Responsive UI/UX design

---

## ✨ Features

### 👨‍🎓 Student Features
- ✅ Register & Login with JWT
- ✅ Browse and search jobs (filter by type, location, experience)
- ✅ Apply for jobs with cover letter
- ✅ Upload CV/Resume (PDF, DOC, DOCX — max 5MB)
- ✅ Save/Favourite jobs
- ✅ View application status (Pending → Shortlisted → Accepted/Rejected)
- ✅ Withdraw pending applications
- ✅ Edit profile (bio, skills, location)
- ✅ Forgot password / Reset password

### 🏢 Company Features
- ✅ Register & Login with JWT
- ✅ Post, edit, and delete jobs
- ✅ View all applicants per job
- ✅ Download/view applicant CVs
- ✅ Accept, Reject, or Shortlist applicants
- ✅ Update company profile and upload logo
- ✅ Dashboard with statistics

### 👑 Admin Features
- ✅ View platform analytics (users, companies, jobs, applications)
- ✅ Manage all users (activate/deactivate/delete)
- ✅ Verify or remove companies
- ✅ Hide or delete inappropriate jobs
- ✅ Monthly jobs chart
- ✅ Recent activity feed

### 🌐 Public Features
- ✅ Home page with featured jobs and top companies
- ✅ Search jobs by keyword, location, type
- ✅ Browse all companies
- ✅ Job detail page
- ✅ Responsive design (mobile/tablet/desktop)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js 18 + Vite |
| **Routing** | React Router DOM v6 |
| **HTTP Client** | Axios |
| **State Management** | Context API |
| **Styling** | Pure CSS (no frameworks) |
| **Backend** | PHP 8.2 (REST API) |
| **Database** | MySQL 8.0 |
| **DB Connection** | PHP PDO |
| **Authentication** | JWT (HS256 — pure PHP) |
| **Password Hashing** | bcrypt (cost 12) |
| **File Uploads** | PHP move_uploaded_file() |
| **Dev Server** | PHP Built-in Server |

---

## 📁 Project Structure

```
job_portal/
│
├── backend/                          # PHP REST API
│   ├── config/
│   │   ├── config.php                # App constants (JWT secret, upload limits)
│   │   └── database.php              # PDO singleton connection
│   │
│   ├── controllers/                  # Business logic
│   │   ├── AuthController.php        # Register, Login, Forgot Password
│   │   ├── JobController.php         # CRUD for jobs
│   │   ├── ApplicationController.php # Apply, status updates
│   │   ├── UserController.php        # Student profile management
│   │   ├── CompanyController.php     # Company profile management
│   │   ├── ResumeController.php      # CV upload/delete
│   │   ├── SavedJobController.php    # Save/unsave jobs
│   │   └── AdminController.php       # Admin management
│   │
│   ├── models/                       # Database queries (PDO)
│   │   ├── UserModel.php
│   │   ├── CompanyModel.php
│   │   ├── JobModel.php
│   │   ├── ApplicationModel.php
│   │   └── ResumeModel.php           # Also contains SavedJobModel
│   │
│   ├── middleware/
│   │   ├── auth.php                  # JWT guard (requireAuth, requireRole)
│   │   └── cors.php                  # CORS headers for React integration
│   │
│   ├── helpers/
│   │   ├── jwt.php                   # Pure PHP JWT (encode/decode)
│   │   └── response.php              # sendSuccess(), sendError(), validate()
│   │
│   ├── routes/
│   │   └── api.php                   # URL router (40+ endpoints)
│   │
│   ├── uploads/                      # Uploaded files
│   │   ├── resumes/                  # Student CVs
│   │   ├── logos/                    # Company logos
│   │   └── profiles/                 # Profile images
│   │
│   ├── database/
│   │   ├── schema.sql                # Database table definitions
│   │   ├── seed.sql                  # Sample data
│   │   └── seed_admin.php            # CLI admin creator
│   │
│   ├── index.php                     # Entry point
│   └── server.php                    # PHP built-in server router
│
└── frontend/                         # React.js Application
    ├── public/
    ├── src/
    │   ├── assets/
    │   │
    │   ├── components/
    │   │   ├── Navbar/               # Sticky responsive navbar
    │   │   ├── Footer/               # Footer with links
    │   │   ├── JobCard/              # Reusable job card
    │   │   └── ProtectedRoute/       # Auth guard component
    │   │
    │   ├── pages/
    │   │   ├── Home/                 # Landing page
    │   │   ├── Jobs/                 # Job listing with filters
    │   │   ├── JobDetail/            # Single job page + apply
    │   │   ├── Companies/            # Company listing
    │   │   ├── Login/                # Login + Forgot Password modal
    │   │   ├── Register/             # Student & Company registration
    │   │   ├── StudentDashboard/     # Student portal
    │   │   ├── CompanyDashboard/     # Company portal
    │   │   ├── AdminDashboard/       # Admin portal
    │   │   ├── About/
    │   │   └── Contact/
    │   │
    │   ├── services/
    │   │   └── api.js                # Axios instance + all API calls
    │   │
    │   ├── context/
    │   │   └── AuthContext.jsx       # Global auth state
    │   │
    │   ├── App.jsx                   # Router configuration
    │   ├── main.jsx                  # React entry point
    │   └── index.css                 # Global design system
    │
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Installation

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (PHP 8.2 + MySQL)
- [Node.js](https://nodejs.org/) v18+
- [VS Code](https://code.visualstudio.com/)

### 1. Clone / Download the project
```bash
# Place project in XAMPP htdocs
C:\xampp\htdocs\job_portal\
```

### 2. Install Frontend Dependencies
```bash
cd C:\xampp\htdocs\job_portal\frontend
npm install
```

---

## 🗄️ Database Setup

### 1. Start XAMPP
- Open **XAMPP Control Panel**
- Start **Apache** and **MySQL**

### 2. Create Database
Open [phpMyAdmin](http://localhost/phpmyadmin) → Click **New** → Name: `job_portal` → Create

### 3. Import Schema
Select `job_portal` database → **SQL tab** → Import `backend/database/schema.sql` → Go

### 4. Import Sample Data
SQL tab → Import `backend/database/seed.sql` → Go

### 5. Create Admin Account
```bash
cd C:\xampp\htdocs\job_portal\backend
C:\xampp\php\php.exe database/seed_admin.php
```

### 6. Configure Database Connection
Edit `backend/config/database.php`:
```php
private static string $host     = 'localhost:3307';  // Your MySQL port
private static string $dbName   = 'job_portal';
private static string $username = 'root';
private static string $password = '';                 // XAMPP default = empty
```

> **Note:** Check your MySQL port in phpMyAdmin — it may be 3306 or 3307.

---

## ▶️ Running the Project

Open **two terminals** in VS Code:

### Terminal 1 — Backend
```bash
cd C:\xampp\htdocs\job_portal\backend
C:\xampp\php\php.exe -S localhost:8000 server.php
```

### Terminal 2 — Frontend
```bash
cd C:\xampp\htdocs\job_portal\frontend
npm run dev
```

### Access the Application
| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 🗄️ phpMyAdmin | http://localhost/phpmyadmin |

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👨‍🎓 Student | kavindu@gmail.com | password |
| 👨‍🎓 Student | dinusha@gmail.com | password |
| 🏢 Company | hr@techvision.lk | password |
| 🏢 Company | careers@axiata.lk | password |
| 👑 Admin | admin@jobportal.com | password |

> **Note:** Register new users for proper bcrypt hashed passwords.

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/student` | Register student |
| POST | `/auth/register/company` | Register company |
| POST | `/auth/login` | Login (all roles) |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| POST | `/auth/check-email` | Verify email (forgot password) |
| POST | `/auth/reset-password` | Reset password |

### Jobs Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs` | Public | List jobs with filters |
| GET | `/jobs/featured` | Public | Featured jobs (home page) |
| GET | `/jobs/{id}` | Public | Job details |
| POST | `/jobs` | Company | Post a job |
| PUT | `/jobs/{id}` | Company | Update job |
| DELETE | `/jobs/{id}` | Company/Admin | Delete job |
| GET | `/jobs/company` | Company | Company's own jobs |
| GET | `/jobs/company/stats` | Company | Dashboard stats |

### Applications Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/applications` | Student | Apply for job |
| GET | `/applications/my` | Student | My applications |
| GET | `/applications/stats` | Student | Application counts |
| DELETE | `/applications/{id}` | Student | Withdraw application |
| GET | `/applications/company` | Company | All applicants |
| GET | `/applications/job/{id}` | Company | Applicants by job |
| PATCH | `/applications/{id}/status` | Company | Accept/Reject |

### Standard Response Format
```json
{
  "success": true,
  "message": "Success",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["optional array"]
}
```

---

## 👥 User Roles

### Student
```
Register → Login → Browse Jobs → Apply → Track Status
                              → Save Jobs
                              → Upload CV
                              → Edit Profile
```

### Company
```
Register → Login → Post Jobs → View Applicants → Accept/Reject
                             → View CVs
                             → Edit Profile
                             → Upload Logo
```

### Admin
```
Login → View Analytics → Manage Users → Manage Companies → Manage Jobs
```

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcrypt with cost factor 12 |
| **Authentication** | JWT HS256 signed tokens (24hr expiry) |
| **SQL Injection Prevention** | PDO prepared statements throughout |
| **File Upload Validation** | MIME type validation (not just extension) |
| **Role-Based Access** | Every API endpoint checks user role |
| **Input Sanitization** | htmlspecialchars() on all user inputs |
| **CORS Protection** | Whitelisted origins only |
| **Directory Listing** | Disabled via .htaccess (Options -Indexes) |

---

## 🗃️ Database Schema

```
users          → id, name, email, password, role, phone, location, bio, skills, profile_image
companies      → id, company_name, email, password, description, logo, website, location, industry
jobs           → id, company_id, title, description, salary_min, salary_max, location, type
applications   → id, user_id, job_id, resume_id, cover_letter, status
resumes        → id, user_id, file_name, file_path, file_size, is_primary
saved_jobs     → id, user_id, job_id
admins         → id, name, email, password
```

---

## 🚀 Future Improvements

- [ ] Email notifications (SMTP) for application status changes
- [ ] Real-time notifications using WebSockets
- [ ] Job recommendation system based on skills
- [ ] LinkedIn OAuth login
- [ ] Advanced analytics dashboard with Chart.js
- [ ] Docker containerization
- [ ] Deploy to AWS / DigitalOcean
- [ ] Unit tests with PHPUnit and Jest
- [ ] Company subscription / premium listings

---

## 👨‍💻 Author

**Software Engineering Student**

Built as a portfolio project demonstrating:
- Full-stack web development
- REST API design and development
- React.js component architecture
- MySQL database design
- JWT authentication system
- Professional UI/UX design

---

## 📄 License

This project is open source and available for educational purposes.

---

<p align="center">Built with ❤️ using React.js + PHP + MySQL</p>
