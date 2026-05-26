<?php
// ============================================================
// controllers/ResumeController.php
// CV/Resume upload and management (students only)
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/ResumeModel.php';

class ResumeController {
    private ResumeModel $model;

    public function __construct() {
        $this->model = new ResumeModel();
    }

    // ── GET /resumes  — student's own resumes ─────────────────
    public function index(): void {
        $payload = requireRole('student');
        $resumes = $this->model->getByUser($payload['sub']);

        // Prepend full URL to file paths
        $resumes = array_map(function ($r) {
            $r['file_url'] = UPLOAD_URL . $r['file_path'];
            return $r;
        }, $resumes);

        sendSuccess(['resumes' => $resumes]);
    }

    // ── POST /resumes  — upload a resume ──────────────────────
    public function upload(): void {
        $payload = requireRole('student');

        if (empty($_FILES['resume'])) {
            sendError('No resume file provided.', 422);
        }

        $file     = $_FILES['resume'];
        $mimeType = mime_content_type($file['tmp_name']);

        if (!in_array($mimeType, ALLOWED_RESUME_TYPES, true)) {
            sendError('Invalid file type. Only PDF and DOC/DOCX allowed.', 422);
        }

        if ($file['size'] > MAX_RESUME_SIZE) {
            sendError('File too large. Maximum size is 5MB.', 422);
        }

        $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '', pathinfo($file['name'], PATHINFO_FILENAME));
        $fileName = 'resume_' . $payload['sub'] . '_' . time() . '_' . $safeName . '.' . $ext;
        $destPath = RESUME_UPLOAD_PATH . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            sendError('Failed to save resume file.', 500);
        }

        $relativePath = 'resumes/' . $fileName;
        $id = $this->model->create(
            $payload['sub'],
            $file['name'],
            $relativePath,
            $file['size']
        );

        $resume            = $this->model->findById($id);
        $resume['file_url'] = UPLOAD_URL . $resume['file_path'];

        sendSuccess(['resume' => $resume], 'Resume uploaded successfully.', 201);
    }

    // ── PATCH /resumes/{id}/primary  — set as primary ─────────
    public function setPrimary(int $id): void {
        $payload = requireRole('student');
        $resume  = $this->model->findById($id);

        if (!$resume || $resume['user_id'] != $payload['sub']) {
            sendNotFound('Resume not found.');
        }

        $this->model->setPrimary($id, $payload['sub']);
        sendSuccess(null, 'Primary resume updated.');
    }

    // ── DELETE /resumes/{id}  — delete a resume ────────────────
    public function destroy(int $id): void {
        $payload  = requireRole('student');
        $filePath = $this->model->delete($id, $payload['sub']);

        if ($filePath === null) {
            sendNotFound('Resume not found or not yours.');
        }

        // Delete physical file
        $fullPath = UPLOAD_BASE_PATH . $filePath;
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        sendSuccess(null, 'Resume deleted successfully.');
    }
}
