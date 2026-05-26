# Job Portal System — Backend API

PHP REST API with JWT Authentication, PDO MySQL, and file uploads.

---

## Tech Stack

| Layer        | Technology                  |
|--------------|-----------------------------|
| Language     | PHP 8.1+                    |
| Database     | MySQL 8.0+                  |
| Auth         | JWT (HS256, pure PHP)       |
| DB Access    | PDO                         |
| File Uploads | PHP `move_uploaded_file()`  |
| Server       | Apache / PHP built-in       |

---

## Quick Start

### 1. Create the Database
```sql
mysql -u root -p < database/schema.sql
mysql -u root -p job_portal < database/seed.sql
```

### 2. Configure
Edit `config/database.php`:
```php
private static string $username = 'root';
private static string $password = 'your_password';
```

Edit `config/config.php` — change the JWT secret:
```php
define('JWT_SECRET', 'your-very-long-random-secret-here');
```

### 3. Create Admin
```bash
php database/seed_admin.php
```

### 4. Run Development Server
```bash
cd backend
php -S localhost:8000 server.php
```

Your API is now at: `http://localhost:8000`

---

## Folder Structure

```
backend/
├── index.php              ← Entry point (all requests go here)
├── server.php             ← PHP built-in server router
├── .htaccess              ← Apache rewrite rules
│
├── config/
│   ├── config.php         ← App constants (JWT, uploads, etc.)
│   └── database.php       ← PDO singleton connection
│
├── middleware/
│   ├── cors.php           ← CORS headers for React integration
│   └── auth.php           ← JWT guard (requireAuth, requireRole)
│
├── helpers/
│   ├── jwt.php            ← JWT encode/decode (pure PHP)
│   └── response.php       ← sendSuccess(), sendError(), validate()
│
├── models/                ← Data-access layer (PDO queries)
│   ├── UserModel.php
│   ├── CompanyModel.php
│   ├── JobModel.php
│   ├── ApplicationModel.php
│   ├── ResumeModel.php    ← also contains SavedJobModel
│
├── controllers/           ← Business logic + request handling
│   ├── AuthController.php
│   ├── JobController.php
│   ├── ApplicationController.php
│   ├── UserController.php
│   ├── CompanyController.php
│   ├── ResumeController.php
│   ├── SavedJobController.php
│   └── AdminController.php
│
├── routes/
│   └── api.php            ← URL router (method + path → controller)
│
├── uploads/               ← Uploaded files (gitignore this!)
│   ├── resumes/
│   ├── logos/
│   └── profiles/
│
└── database/
    ├── schema.sql         ← Table definitions
    ├── seed.sql           ← Sample data
    └── seed_admin.php     ← CLI script to create admin
```

---

## API Endpoints Reference

### Auth
| Method | Endpoint                    | Auth     | Description          |
|--------|-----------------------------|----------|----------------------|
| POST   | `/auth/register/student`    | None     | Register student     |
| POST   | `/auth/register/company`    | None     | Register company     |
| POST   | `/auth/login`               | None     | Login (any role)     |
| POST   | `/auth/logout`              | JWT      | Logout               |
| GET    | `/auth/me`                  | JWT      | Get current user     |

**Login body:**
```json
{ "email": "...", "password": "...", "role": "student|company|admin" }
```

### Jobs
| Method | Endpoint                    | Auth          | Description              |
|--------|-----------------------------|---------------|--------------------------|
| GET    | `/jobs`                     | None          | Browse jobs (filters)    |
| GET    | `/jobs/featured`            | None          | Home page jobs           |
| GET    | `/jobs/{id}`                | None          | Single job detail        |
| POST   | `/jobs`                     | Company JWT   | Post a job               |
| PUT    | `/jobs/{id}`                | Company JWT   | Edit a job               |
| DELETE | `/jobs/{id}`                | Company/Admin | Delete a job             |
| GET    | `/jobs/company`             | Company JWT   | Company's own jobs       |
| GET    | `/jobs/company/stats`       | Company JWT   | Dashboard statistics     |

**Query params for GET /jobs:**
- `search`, `type`, `location`, `category`, `experience_level`, `page`

### Applications
| Method | Endpoint                         | Auth         | Description              |
|--------|----------------------------------|--------------|--------------------------|
| POST   | `/applications`                  | Student JWT  | Apply for a job          |
| GET    | `/applications/my`               | Student JWT  | My applications          |
| GET    | `/applications/stats`            | Student JWT  | Application counts       |
| GET    | `/applications/{id}`             | JWT          | Single application       |
| DELETE | `/applications/{id}`             | Student JWT  | Withdraw application     |
| GET    | `/applications/job/{jobId}`      | Company JWT  | Applicants for a job     |
| GET    | `/applications/company`          | Company JWT  | All company applicants   |
| PATCH  | `/applications/{id}/status`      | Company JWT  | Accept / Reject          |

**Status values:** `pending` → `reviewed` → `shortlisted` → `accepted` / `rejected`

### Users (Student Profile)
| Method | Endpoint                    | Auth         | Description          |
|--------|-----------------------------|--------------|----------------------|
| GET    | `/users/profile`            | Student JWT  | Get own profile      |
| PUT    | `/users/profile`            | Student JWT  | Update profile       |
| POST   | `/users/profile/image`      | Student JWT  | Upload profile photo |
| PUT    | `/users/password`           | Student JWT  | Change password      |
| GET    | `/users/{id}`               | None         | Public profile       |

### Companies
| Method | Endpoint                    | Auth         | Description          |
|--------|-----------------------------|--------------|----------------------|
| GET    | `/companies`                | None         | Browse companies     |
| GET    | `/companies/{id}`           | None         | Company public page  |
| GET    | `/companies/profile`        | Company JWT  | Own profile          |
| PUT    | `/companies/profile`        | Company JWT  | Update profile       |
| POST   | `/companies/logo`           | Company JWT  | Upload logo          |
| PUT    | `/companies/password`       | Company JWT  | Change password      |

### Resumes
| Method | Endpoint                    | Auth         | Description          |
|--------|-----------------------------|--------------|----------------------|
| GET    | `/resumes`                  | Student JWT  | List my resumes      |
| POST   | `/resumes`                  | Student JWT  | Upload resume        |
| PATCH  | `/resumes/{id}/primary`     | Student JWT  | Set as primary       |
| DELETE | `/resumes/{id}`             | Student JWT  | Delete resume        |

### Saved Jobs
| Method | Endpoint                    | Auth         | Description          |
|--------|-----------------------------|--------------|----------------------|
| GET    | `/saved-jobs`               | Student JWT  | My saved jobs        |
| POST   | `/saved-jobs`               | Student JWT  | Save a job           |
| DELETE | `/saved-jobs/{id}`          | Student JWT  | Unsave a job         |
| GET    | `/saved-jobs/check/{id}`    | Student JWT  | Is job saved?        |

### Admin
| Method | Endpoint                           | Auth       | Description              |
|--------|------------------------------------|------------|--------------------------|
| GET    | `/admin/stats`                     | Admin JWT  | Platform analytics       |
| GET    | `/admin/users`                     | Admin JWT  | All students             |
| PATCH  | `/admin/users/{id}/toggle`         | Admin JWT  | Activate/deactivate user |
| DELETE | `/admin/users/{id}`                | Admin JWT  | Delete user              |
| GET    | `/admin/companies`                 | Admin JWT  | All companies            |
| PATCH  | `/admin/companies/{id}/verify`     | Admin JWT  | Verify/unverify company  |
| DELETE | `/admin/companies/{id}`            | Admin JWT  | Delete company           |
| GET    | `/admin/jobs`                      | Admin JWT  | All jobs                 |
| PATCH  | `/admin/jobs/{id}/toggle`          | Admin JWT  | Show/hide job            |
| DELETE | `/admin/jobs/{id}`                 | Admin JWT  | Delete job               |

---

## JWT Usage

All protected endpoints require:
```
Authorization: Bearer <your_token>
```

**Token payload structure:**
```json
{ "sub": 1, "role": "student|company|admin", "name": "...", "iat": ..., "exp": ... }
```

---

## File Uploads

| Type           | Field name | Max size | Allowed types          |
|----------------|------------|----------|------------------------|
| Resume/CV      | `resume`   | 5 MB     | PDF, DOC, DOCX         |
| Company logo   | `logo`     | 2 MB     | JPEG, PNG, WEBP        |
| Profile image  | `image`    | 2 MB     | JPEG, PNG, WEBP        |

Upload via `multipart/form-data` (NOT JSON).

---

## Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "...",
  "errors": ["optional array of field errors"]
}
```

---

## Security Features

- Passwords hashed with `bcrypt` (cost=12)
- JWT signed with `HMAC-SHA256`
- PDO prepared statements (no SQL injection)
- MIME type validation on all uploads
- Role-based access control on every endpoint
- Input sanitized with `htmlspecialchars`
- File uploads stored outside web-accessible paths (configurable)
- `OPTIONS -Indexes` in `.htaccess` (no directory listing)

---

## Deployment Checklist

- [ ] Change `JWT_SECRET` in `config/config.php`
- [ ] Change DB credentials in `config/database.php`
- [ ] Set `APP_ENV` to `'production'`
- [ ] Update `ALLOWED_ORIGINS` in `middleware/cors.php` to your frontend domain
- [ ] Update `APP_URL` in `config/config.php` to your server URL
- [ ] Run `php database/seed_admin.php` and **delete the file**
- [ ] Ensure `uploads/` is writable: `chmod -R 755 uploads/`
- [ ] Configure SMTP in `config/config.php` for email notifications
