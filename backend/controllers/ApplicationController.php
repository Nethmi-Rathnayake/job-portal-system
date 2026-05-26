<?php
// ============================================================
// controllers/ApplicationController.php
// Apply, view, update status, withdraw
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/ApplicationModel.php';
require_once __DIR__ . '/../models/JobModel.php';
require_once __DIR__ . '/../models/ResumeModel.php';

class ApplicationController {
    private ApplicationModel $appModel;
    private JobModel         $jobModel;
    private ResumeModel      $resumeModel;

    public function __construct() {
        $this->appModel    = new ApplicationModel();
        $this->jobModel    = new JobModel();
        $this->resumeModel = new ResumeModel();
    }

    // ── POST /applications  — student applies for a job ──────
    public function store(): void {
        $payload = requireRole('student');
        $data    = getJsonBody();
        $errors  = validateRequired($data, ['job_id']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $jobId = (int) $data['job_id'];
        $job   = $this->jobModel->findById($jobId);

        if (!$job)           sendNotFound('Job not found.');
        if (!$job['is_active']) sendError('This job is no longer accepting applications.', 400);

        // Check deadline
        if ($job['deadline'] && strtotime($job['deadline']) < time()) {
            sendError('The application deadline has passed.', 400);
        }

        // Attach primary resume if not specified
        $resumeId = isset($data['resume_id']) ? (int) $data['resume_id'] : null;
        if (!$resumeId) {
            $primary  = $this->resumeModel->getPrimary($payload['sub']);
            $resumeId = $primary['id'] ?? null;
        }

        $appId = $this->appModel->create(
            $payload['sub'],
            $jobId,
            $resumeId,
            isset($data['cover_letter']) ? sanitize($data['cover_letter']) : null
        );

        if ($appId === false) {
            sendError('You have already applied for this job.', 409);
        }

        $application = $this->appModel->findById($appId);
        sendSuccess(['application' => $application], 'Application submitted successfully.', 201);
    }

    // ── GET /applications/my  — student's own applications ───
    public function myApplications(): void {
        $payload = requireRole('student');
        $page    = (int) ($_GET['page'] ?? 1);
        $result  = $this->appModel->getByUser($payload['sub'], $page);
        sendSuccess($result);
    }

    // ── GET /applications/stats  — student dashboard stats ───
    public function myStats(): void {
        $payload = requireRole('student');
        $stats   = $this->appModel->getUserStats($payload['sub']);
        sendSuccess(['stats' => $stats]);
    }

    // ── GET /applications/job/{jobId}  — company sees applicants
    public function byJob(int $jobId): void {
        $payload = requireRole('company');
        $page    = (int) ($_GET['page'] ?? 1);
        $result  = $this->appModel->getByJob($jobId, $payload['sub'], $page);
        sendSuccess($result);
    }

    // ── GET /applications/company  — all applicants for company
    public function byCompany(): void {
        $payload = requireRole('company');
        $page    = (int) ($_GET['page'] ?? 1);
        $status  = $_GET['status'] ?? '';
        $result  = $this->appModel->getByCompany($payload['sub'], $page, $status);
        sendSuccess($result);
    }

    // ── GET /applications/{id}  — single application detail ──
    public function show(int $id): void {
        $payload     = requireAuth();
        $application = $this->appModel->findById($id);

        if (!$application) sendNotFound('Application not found.');

        // Student sees only their own; company sees only their job's apps
        if ($payload['role'] === 'student' && $application['user_id'] != $payload['sub']) {
            sendForbidden();
        }

        sendSuccess(['application' => $application]);
    }

    // ── PATCH /applications/{id}/status  — company updates ───
    public function updateStatus(int $id): void {
        $payload = requireRole('company');
        $data    = getJsonBody();
        $errors  = validateRequired($data, ['status']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $allowed = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];
        if (!in_array($data['status'], $allowed, true)) {
            sendError('Invalid status value.', 422);
        }

        $updated = $this->appModel->updateStatus(
            $id,
            $payload['sub'],
            $data['status'],
            $data['notes'] ?? null
        );

        if (!$updated) sendError('Application not found or you are not authorized.', 404);

        sendSuccess(null, 'Application status updated.');
    }

    // ── DELETE /applications/{id}  — student withdraws ───────
    public function withdraw(int $id): void {
        $payload = requireRole('student');
        $deleted = $this->appModel->withdraw($id, $payload['sub']);

        if (!$deleted) {
            sendError('Application not found, already processed, or cannot be withdrawn.', 400);
        }

        sendSuccess(null, 'Application withdrawn successfully.');
    }
}
