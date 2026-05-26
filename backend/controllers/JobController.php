<?php
// ============================================================
// controllers/JobController.php
// CRUD for jobs — public browsing + company management
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/JobModel.php';
require_once __DIR__ . '/../models/SavedJobModel.php';

class JobController {
    private JobModel      $jobModel;
    private SavedJobModel $savedModel;

    public function __construct() {
        $this->jobModel   = new JobModel();
        $this->savedModel = new SavedJobModel();
    }

    // ── GET /jobs  (public, with filters + pagination) ───────
    public function index(): void {
        $page    = (int) ($_GET['page'] ?? 1);
        $filters = [
            'search'           => $_GET['search']           ?? '',
            'type'             => $_GET['type']             ?? '',
            'location'         => $_GET['location']         ?? '',
            'category'         => $_GET['category']         ?? '',
            'experience_level' => $_GET['experience_level'] ?? '',
        ];

        $result = $this->jobModel->getAll($filters, $page);

        // If authenticated student, flag saved jobs
        $payload = optionalAuth();
        if ($payload && $payload['role'] === 'student') {
            $userId = $payload['sub'];
            $result['jobs'] = array_map(function ($job) use ($userId) {
                $job['is_saved'] = $this->savedModel->isSaved($userId, $job['id']);
                return $job;
            }, $result['jobs']);
        }

        sendSuccess($result);
    }

    // ── GET /jobs/featured  (home page) ──────────────────────
    public function featured(): void {
        $limit = (int) ($_GET['limit'] ?? 6);
        $jobs  = $this->jobModel->getFeatured($limit);
        sendSuccess(['jobs' => $jobs]);
    }

    // ── GET /jobs/{id}  (public) ─────────────────────────────
    public function show(int $id): void {
        $job = $this->jobModel->findById($id);
        if (!$job) sendNotFound('Job not found.');

        $this->jobModel->incrementViews($id);

        // Flag applied/saved for students
        $payload = optionalAuth();
        if ($payload && $payload['role'] === 'student') {
            require_once __DIR__ . '/../models/ApplicationModel.php';
            $appModel        = new ApplicationModel();
            $job['applied']  = $appModel->hasApplied($payload['sub'], $id);
            $job['is_saved'] = $this->savedModel->isSaved($payload['sub'], $id);
        }

        sendSuccess(['job' => $job]);
    }

    // ── POST /jobs  (company only) ────────────────────────────
    public function store(): void {
        $payload = requireRole('company');
        $data    = getJsonBody();
        $errors  = validateRequired($data, ['title', 'description']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $id = $this->jobModel->create($payload['sub'], [
            'title'            => sanitize($data['title']),
            'description'      => $data['description'],
            'requirements'     => $data['requirements']     ?? null,
            'responsibilities' => $data['responsibilities'] ?? null,
            'salary_min'       => $data['salary_min']       ?? null,
            'salary_max'       => $data['salary_max']       ?? null,
            'salary_type'      => $data['salary_type']      ?? 'monthly',
            'location'         => isset($data['location'])  ? sanitize($data['location']) : null,
            'type'             => $data['type']             ?? 'full-time',
            'experience_level' => $data['experience_level'] ?? 'any',
            'category'         => isset($data['category'])  ? sanitize($data['category']) : null,
            'deadline'         => $data['deadline']         ?? null,
        ]);

        $job = $this->jobModel->findById($id);
        sendSuccess(['job' => $job], 'Job posted successfully.', 201);
    }

    // ── PUT /jobs/{id}  (company only) ────────────────────────
    public function update(int $id): void {
        $payload = requireRole('company');
        $data    = getJsonBody();

        $allowed = ['title', 'description', 'requirements', 'responsibilities',
                    'salary_min', 'salary_max', 'salary_type', 'location',
                    'type', 'experience_level', 'category', 'deadline', 'is_active'];

        $clean = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $clean[$field] = is_string($data[$field]) ? sanitize($data[$field]) : $data[$field];
            }
        }

        $updated = $this->jobModel->update($id, $payload['sub'], $clean);
        if (!$updated) sendError('Job not found or you are not authorized.', 404);

        sendSuccess(['job' => $this->jobModel->findById($id)], 'Job updated successfully.');
    }

    // ── DELETE /jobs/{id}  (company or admin) ─────────────────
    public function destroy(int $id): void {
        $payload = requireRole(['company', 'admin']);

        if ($payload['role'] === 'admin') {
            $this->jobModel->adminDelete($id);
        } else {
            $deleted = $this->jobModel->delete($id, $payload['sub']);
            if (!$deleted) sendError('Job not found or you are not authorized.', 404);
        }

        sendSuccess(null, 'Job deleted successfully.');
    }

    // ── GET /jobs/company  (company's own jobs) ───────────────
    public function companyJobs(): void {
        $payload = requireRole('company');
        $page    = (int) ($_GET['page'] ?? 1);
        $result  = $this->jobModel->getByCompany($payload['sub'], $page);
        sendSuccess($result);
    }

    // ── GET /jobs/company/stats ───────────────────────────────
    public function companyStats(): void {
        $payload = requireRole('company');
        $stats   = $this->jobModel->getCompanyStats($payload['sub']);
        sendSuccess(['stats' => $stats]);
    }
}
