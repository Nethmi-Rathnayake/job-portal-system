-- ============================================================
-- Job Portal System - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS job_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_portal;

-- ============================================================
-- TABLE: users (Students)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    email       VARCHAR(191)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        ENUM('student','admin') DEFAULT 'student',
    phone       VARCHAR(20)     DEFAULT NULL,
    location    VARCHAR(150)    DEFAULT NULL,
    bio         TEXT            DEFAULT NULL,
    skills      TEXT            DEFAULT NULL,         -- comma-separated
    profile_image VARCHAR(255)  DEFAULT NULL,
    is_active   TINYINT(1)      DEFAULT 1,
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: companies
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    company_name    VARCHAR(150)    NOT NULL,
    email           VARCHAR(191)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    logo            VARCHAR(255)    DEFAULT NULL,
    website         VARCHAR(255)    DEFAULT NULL,
    phone           VARCHAR(20)     DEFAULT NULL,
    location        VARCHAR(150)    DEFAULT NULL,
    industry        VARCHAR(100)    DEFAULT NULL,
    founded_year    YEAR            DEFAULT NULL,
    employee_count  VARCHAR(50)     DEFAULT NULL,
    is_verified     TINYINT(1)      DEFAULT 0,
    is_active       TINYINT(1)      DEFAULT 1,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    company_id      INT             NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            NOT NULL,
    requirements    TEXT            DEFAULT NULL,
    responsibilities TEXT           DEFAULT NULL,
    salary_min      DECIMAL(10,2)   DEFAULT NULL,
    salary_max      DECIMAL(10,2)   DEFAULT NULL,
    salary_type     ENUM('monthly','yearly','hourly') DEFAULT 'monthly',
    location        VARCHAR(150)    DEFAULT NULL,
    type            ENUM('full-time','part-time','remote','contract','internship') DEFAULT 'full-time',
    experience_level ENUM('entry','mid','senior','lead','any') DEFAULT 'any',
    category        VARCHAR(100)    DEFAULT NULL,
    deadline        DATE            DEFAULT NULL,
    is_active       TINYINT(1)      DEFAULT 1,
    views           INT             DEFAULT 0,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    job_id          INT             NOT NULL,
    resume_id       INT             DEFAULT NULL,
    cover_letter    TEXT            DEFAULT NULL,
    status          ENUM('pending','reviewed','shortlisted','accepted','rejected') DEFAULT 'pending',
    company_notes   TEXT            DEFAULT NULL,
    applied_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (job_id)  REFERENCES jobs(id)     ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: resumes
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT             NOT NULL,
    file_name   VARCHAR(255)    NOT NULL,
    file_path   VARCHAR(255)    NOT NULL,
    file_size   INT             DEFAULT NULL,      -- in bytes
    is_primary  TINYINT(1)      DEFAULT 0,
    uploaded_at DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: saved_jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT             NOT NULL,
    job_id      INT             NOT NULL,
    saved_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_saved (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: admin (separate admin accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    email       VARCHAR(191)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- SEED: Default Admin Account
-- Password: admin123  (bcrypt hashed)
-- ============================================================
INSERT INTO admins (name, email, password) VALUES
('Super Admin', 'admin@jobportal.com', '$2y$12$DUMMY_REPLACE_WITH_REAL_HASH');

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_jobs_company   ON jobs(company_id);
CREATE INDEX idx_jobs_active    ON jobs(is_active);
CREATE INDEX idx_jobs_type      ON jobs(type);
CREATE INDEX idx_jobs_location  ON jobs(location);
CREATE INDEX idx_apps_user      ON applications(user_id);
CREATE INDEX idx_apps_job       ON applications(job_id);
CREATE INDEX idx_apps_status    ON applications(status);
CREATE INDEX idx_saved_user     ON saved_jobs(user_id);
