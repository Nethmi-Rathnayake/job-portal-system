<?php
// ============================================================
// routes/api.php
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/jwt.php';

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/JobController.php';
require_once __DIR__ . '/../controllers/ApplicationController.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../controllers/CompanyController.php';
require_once __DIR__ . '/../controllers/ResumeController.php';
require_once __DIR__ . '/../controllers/SavedJobController.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = '/' . trim(preg_replace('#^/+#', '', $uri), '/');
$uri    = rtrim($uri, '/') ?: '/';

$routes = [
    // ── Auth ─────────────────────────────────────────────
    ['POST', '/auth/register/student',       'AuthController', 'registerStudent'],
    ['POST', '/auth/register/company',       'AuthController', 'registerCompany'],
    ['POST', '/auth/login',                  'AuthController', 'login'],
    ['POST', '/auth/logout',                 'AuthController', 'logout'],
    ['GET',  '/auth/me',                     'AuthController', 'me'],
    ['POST', '/auth/check-email',            'AuthController', 'checkEmail'],    // NEW
    ['POST', '/auth/reset-password',         'AuthController', 'resetPassword'], // NEW

    // ── Jobs ─────────────────────────────────────────────
    ['GET',    '/jobs',                      'JobController', 'index'],
    ['GET',    '/jobs/featured',             'JobController', 'featured'],
    ['GET',    '/jobs/company',              'JobController', 'companyJobs'],
    ['GET',    '/jobs/company/stats',        'JobController', 'companyStats'],
    ['POST',   '/jobs',                      'JobController', 'store'],
    ['GET',    '/jobs/{id}',                 'JobController', 'show'],
    ['PUT',    '/jobs/{id}',                 'JobController', 'update'],
    ['DELETE', '/jobs/{id}',                 'JobController', 'destroy'],

    // ── Applications ─────────────────────────────────────
    ['POST',   '/applications',              'ApplicationController', 'store'],
    ['GET',    '/applications/my',           'ApplicationController', 'myApplications'],
    ['GET',    '/applications/stats',        'ApplicationController', 'myStats'],
    ['GET',    '/applications/company',      'ApplicationController', 'byCompany'],
    ['GET',    '/applications/{id}',         'ApplicationController', 'show'],
    ['GET',    '/applications/job/{id}',     'ApplicationController', 'byJob'],
    ['PATCH',  '/applications/{id}/status',  'ApplicationController', 'updateStatus'],
    ['DELETE', '/applications/{id}',         'ApplicationController', 'withdraw'],

    // ── Users / Students ─────────────────────────────────
    ['GET',    '/users/profile',             'UserController', 'profile'],
    ['PUT',    '/users/profile',             'UserController', 'updateProfile'],
    ['POST',   '/users/profile/image',       'UserController', 'uploadProfileImage'],
    ['PUT',    '/users/password',            'UserController', 'changePassword'],
    ['GET',    '/users/{id}',                'UserController', 'publicProfile'],

    // ── Companies ─────────────────────────────────────────
    ['GET',    '/companies',                 'CompanyController', 'index'],
    ['GET',    '/companies/profile',         'CompanyController', 'myProfile'],
    ['PUT',    '/companies/profile',         'CompanyController', 'updateProfile'],
    ['POST',   '/companies/logo',            'CompanyController', 'uploadLogo'],
    ['PUT',    '/companies/password',        'CompanyController', 'changePassword'],
    ['GET',    '/companies/{id}',            'CompanyController', 'show'],

    // ── Resumes ───────────────────────────────────────────
    ['GET',    '/resumes',                   'ResumeController', 'index'],
    ['POST',   '/resumes',                   'ResumeController', 'upload'],
    ['PATCH',  '/resumes/{id}/primary',      'ResumeController', 'setPrimary'],
    ['DELETE', '/resumes/{id}',              'ResumeController', 'destroy'],

    // ── Saved Jobs ────────────────────────────────────────
    ['GET',    '/saved-jobs',                'SavedJobController', 'index'],
    ['POST',   '/saved-jobs',                'SavedJobController', 'save'],
    ['DELETE', '/saved-jobs/{id}',           'SavedJobController', 'unsave'],
    ['GET',    '/saved-jobs/check/{id}',     'SavedJobController', 'check'],

    // ── Admin ─────────────────────────────────────────────
    ['GET',    '/admin/stats',               'AdminController', 'stats'],
    ['GET',    '/admin/users',               'AdminController', 'users'],
    ['PATCH',  '/admin/users/{id}/toggle',   'AdminController', 'toggleUser'],
    ['DELETE', '/admin/users/{id}',          'AdminController', 'deleteUser'],
    ['GET',    '/admin/companies',           'AdminController', 'companies'],
    ['PATCH',  '/admin/companies/{id}/verify','AdminController','verifyCompany'],
    ['DELETE', '/admin/companies/{id}',      'AdminController', 'deleteCompany'],
    ['GET',    '/admin/jobs',                'AdminController', 'jobs'],
    ['DELETE', '/admin/jobs/{id}',           'AdminController', 'deleteJob'],
    ['PATCH',  '/admin/jobs/{id}/toggle',    'AdminController', 'toggleJob'],
];

foreach ($routes as $route) {
    [$routeMethod, $pattern, $controller, $action] = $route;
    if ($routeMethod !== $method) continue;
    $regex = preg_replace('/\{[a-z]+\}/', '(\d+)', $pattern);
    $regex = '#^' . $regex . '$#';
    if (preg_match($regex, $uri, $matches)) {
        array_shift($matches);
        $obj  = new $controller();
        $args = array_map('intval', $matches);
        call_user_func_array([$obj, $action], $args);
        exit;
    }
}

sendNotFound("Route not found: $method $uri");
