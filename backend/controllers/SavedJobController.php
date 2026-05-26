<?php
// ============================================================
// controllers/SavedJobController.php
// Save / unsave / list saved jobs (students only)
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/SavedJobModel.php';

class SavedJobController {
    private SavedJobModel $model;

    public function __construct() {
        $this->model = new SavedJobModel();
    }

    // ── GET /saved-jobs ───────────────────────────────────────
    public function index(): void {
        $payload = requireRole('student');
        $page    = (int) ($_GET['page'] ?? 1);
        $result  = $this->model->getByUser($payload['sub'], $page);
        sendSuccess($result);
    }

    // ── POST /saved-jobs  { job_id } ──────────────────────────
    public function save(): void {
        $payload = requireRole('student');
        $data    = getJsonBody();
        $errors  = validateRequired($data, ['job_id']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $jobId  = (int) $data['job_id'];
        $saved  = $this->model->save($payload['sub'], $jobId);

        if (!$saved) sendError('Job already saved.', 409);

        sendSuccess(null, 'Job saved to favourites.', 201);
    }

    // ── DELETE /saved-jobs/{jobId} ────────────────────────────
    public function unsave(int $jobId): void {
        $payload = requireRole('student');
        $removed = $this->model->unsave($payload['sub'], $jobId);

        if (!$removed) sendError('Job was not in your saved list.', 404);

        sendSuccess(null, 'Job removed from favourites.');
    }

    // ── GET /saved-jobs/check/{jobId} ─────────────────────────
    public function check(int $jobId): void {
        $payload = requireRole('student');
        $isSaved = $this->model->isSaved($payload['sub'], $jobId);
        sendSuccess(['is_saved' => $isSaved]);
    }
}
