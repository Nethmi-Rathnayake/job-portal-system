-- ============================================================
-- Job Portal System - Sample Seed Data
-- Run AFTER schema.sql
-- ============================================================
USE job_portal;

-- Sample Companies (password: company123)
INSERT INTO companies (company_name, email, password, description, website, location, industry, founded_year, employee_count, is_verified) VALUES
('TechVision Lanka', 'hr@techvision.lk', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Leading software company in Sri Lanka building cutting-edge SaaS products.', 'https://techvision.lk', 'Colombo 03', 'Information Technology', 2015, '51-200', 1),
('Axiata Digital', 'careers@axiata.lk', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Digital services and telecommunications giant operating across Asia.', 'https://axiata.com', 'Colombo 01', 'Telecommunications', 2008, '201-500', 1),
('99X Technology', 'jobs@99x.io', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Award-winning software product development company.', 'https://99x.io', 'Colombo 05', 'Software Development', 2010, '201-500', 1);

-- Sample Jobs
INSERT INTO jobs (company_id, title, description, requirements, salary_min, salary_max, location, type, experience_level, category) VALUES
(1, 'React.js Developer', 'Build scalable frontend applications using React.js and modern JavaScript.', 'React, JavaScript, CSS, REST APIs, 2+ years experience', 80000, 150000, 'Colombo 03', 'full-time', 'mid', 'Engineering'),
(1, 'Software Engineering Intern', '6-month internship for CS/SE undergraduates. Learn real-world development.', 'Pursuing CS/SE degree, Java or Python basics', 25000, 35000, 'Colombo 03', 'internship', 'entry', 'Engineering'),
(2, 'Backend PHP Developer', 'Develop and maintain PHP-based APIs for our telecom platforms.', 'PHP, MySQL, REST APIs, Laravel preferred', 90000, 160000, 'Colombo 01', 'full-time', 'senior', 'Engineering'),
(3, 'UI/UX Designer', 'Design user-centric interfaces for our SaaS products.', 'Figma, Adobe XD, prototyping, 3+ years', 70000, 130000, 'Remote', 'remote', 'mid', 'Design'),
(3, 'DevOps Engineer', 'Manage CI/CD pipelines, cloud infrastructure, and deployment automation.', 'Docker, Kubernetes, AWS, CI/CD', 120000, 200000, 'Colombo 05', 'full-time', 'senior', 'DevOps');

-- Sample Students (password: student123)
INSERT INTO users (name, email, password, role, location, bio, skills) VALUES
('Kavindu Perera', 'kavindu@gmail.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Colombo', '3rd year SE student passionate about full-stack development.', 'React,PHP,MySQL,JavaScript'),
('Dinusha Silva', 'dinusha@gmail.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', 'Kandy', 'CS undergraduate with interest in UI/UX and frontend development.', 'React,Figma,CSS,HTML');

-- Real Admin (password: Admin@2025!)
-- Generate with: password_hash('Admin@2025!', PASSWORD_BCRYPT, ['cost'=>12])
-- Replace the dummy hash below after running seed_admin.php
INSERT INTO admins (name, email, password) VALUES
('System Admin', 'sysadmin@jobportal.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE name=VALUES(name);
