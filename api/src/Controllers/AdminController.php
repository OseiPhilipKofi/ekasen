<?php
declare(strict_types=1);

namespace TiFund\Controllers;

use PDO;
use TiFund\Http\Response;
use TiFund\Http\Upload;
use TiFund\Repositories\ContentRepository;

final class AdminController
{
    public function __construct(private readonly PDO $pdo, private readonly ContentRepository $content, private readonly Response $response)
    {
    }

    private function requireAdmin(array $user): void
    {
        if (($user['role'] ?? '') !== 'admin') {
            $this->response->json(['error' => 'Admin access required'], 403);
        }
    }

    public function teachers(array $user): never
    {
        $this->requireAdmin($user);
        $teachers = $this->pdo->query("SELECT u.id, u.name, u.email, u.status, u.created_at, p.phone, p.school_name, p.staff_id, p.national_id, p.birth_date, p.profile_photo_path, p.verification_status FROM users u LEFT JOIN teacher_profiles p ON p.user_id=u.id WHERE u.role='teacher' ORDER BY u.created_at DESC")->fetchAll();
        foreach ($teachers as &$teacher) {
            $teacher['teacher_profile'] = array_intersect_key($teacher, array_flip(['phone', 'school_name', 'staff_id', 'national_id', 'birth_date', 'profile_photo_path', 'verification_status']));
        }
        unset($teacher);
        $this->response->json(['teachers' => $teachers]);
    }

    public function users(array $user): never
    {
        $this->requireAdmin($user);
        $users = $this->pdo->query('SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, p.phone, p.school_name, p.staff_id, p.national_id, p.birth_date, p.profile_photo_path, p.verification_status FROM users u LEFT JOIN teacher_profiles p ON p.user_id=u.id ORDER BY u.created_at DESC')->fetchAll();
        foreach ($users as &$entry) {
            $entry['teacher_profile'] = array_intersect_key($entry, array_flip(['phone', 'school_name', 'staff_id', 'national_id', 'birth_date', 'profile_photo_path', 'verification_status']));
        }
        unset($entry);
        $this->response->json(['users' => $users]);
    }

    public function registerTeacher(array $user, array $payload, array $files): never
    {
        $this->requireAdmin($user);
        $name = trim((string)($payload['name'] ?? ''));
        $email = filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $phone = trim((string)($payload['phone'] ?? ''));
        if ($name === '' || !$email || $phone === '' || trim((string)($payload['school'] ?? $payload['school_name'] ?? '')) === '' || trim((string)($payload['staff_id'] ?? '')) === '') {
            $this->response->json(['error' => 'Name, email, phone, school and staff ID are required'], 422);
        }
        $this->pdo->beginTransaction();
        $createdPaths = [];
        try {
            $q = $this->pdo->prepare("INSERT INTO users (google_id, name, email, role, status) VALUES (?, ?, ?, 'teacher', 'active')");
            $q->execute(['admin:' . bin2hex(random_bytes(16)), $name, $email]);
            $id = (int)$this->pdo->lastInsertId();
            $p = $this->pdo->prepare('INSERT INTO teacher_profiles (user_id, phone, school_name, staff_id, national_id, birth_date) VALUES (?, ?, ?, ?, ?, ?)');
            $p->execute([$id, $phone, trim((string)($payload['school'] ?? $payload['school_name'])), trim((string)$payload['staff_id']), trim((string)($payload['national_id'] ?? $payload['ghana_card'] ?? '')) ?: null, $payload['birth_date'] ?? null]);
            $replacedPaths = $this->storeDocuments($id, $files, $createdPaths);
            $this->log((int)$user['id'], $id, 'teacher.created', 'user', $id, ['email' => $email]);
            $this->pdo->commit();
        } catch (\Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            $cleanupErrors = [];
            foreach ($createdPaths as $path) {
                try {
                    Upload::deleteIfUnreferenced($this->pdo, $path);
                } catch (\Throwable $cleanupError) {
                    $cleanupErrors[] = $cleanupError->getMessage();
                }
            }
            $message = $e->getMessage();
            if ($cleanupErrors) {
                $message .= ' Upload cleanup failed: ' . implode('; ', $cleanupErrors);
            }
            $this->response->json(['error' => $message], 422);
        }
        foreach ($replacedPaths as $path) {
            Upload::deleteIfUnreferenced($this->pdo, $path);
        }
        $this->response->json(['message' => 'Teacher registered', 'user_id' => $id], 201);
    }

    private function storeDocuments(int $userId, array $files, array &$createdPaths): array
    {
        $map = ['national_id' => 'national_id', 'ghana_card' => 'national_id', 'birth_certificate' => 'birth_certificate', 'teacher_certificate' => 'teacher_certificate'];
        $replacedPaths = [];
        foreach ($map as $field => $type) {
            if (!isset($files[$field])) continue;
            $saved = Upload::save($files[$field], 'document');
            $createdPaths[] = $saved['path'];
            $existing = $this->pdo->prepare('SELECT file_path FROM teacher_documents WHERE user_id=? AND document_type=?');
            $existing->execute([$userId, $type]);
            foreach ($existing->fetchAll(PDO::FETCH_COLUMN) as $path) {
                if (is_string($path) && $path !== '') {
                    $replacedPaths[] = $path;
                }
            }
            $remove = $this->pdo->prepare('DELETE FROM teacher_documents WHERE user_id=? AND document_type=?');
            $remove->execute([$userId, $type]);
            $q = $this->pdo->prepare('INSERT INTO teacher_documents (user_id, document_type, file_path, original_name, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?, ?)');
            $q->execute([$userId, $type, $saved['path'], $saved['original_name'], $saved['mime_type'], $saved['size_bytes']]);
        }
        if (isset($files['profile_photo'])) {
            $existing = $this->pdo->prepare('SELECT profile_photo_path FROM teacher_profiles WHERE user_id=?');
            $existing->execute([$userId]);
            $previousPhotoPath = $existing->fetchColumn();
            $saved = Upload::save($files['profile_photo'], 'photo');
            $createdPaths[] = $saved['path'];
            $q = $this->pdo->prepare('UPDATE teacher_profiles SET profile_photo_path=? WHERE user_id=?');
            $q->execute([$saved['path'], $userId]);
            if (is_string($previousPhotoPath) && $previousPhotoPath !== '') {
                $replacedPaths[] = $previousPhotoPath;
            }
        }
        return array_values(array_unique($replacedPaths));
    }

    public function summary(array $user): never
    {
        $this->requireAdmin($user);
        $teachers = (int)$this->pdo->query("SELECT COUNT(*) FROM users WHERE role='teacher'")->fetchColumn();
        $messages = (int)$this->pdo->query("SELECT COUNT(*) FROM contact_messages WHERE status='unread'")->fetchColumn();
        $cashflow = (float)$this->pdo->query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status='success' AND created_at >= date('now', 'start of month')")->fetchColumn();
        $this->response->json(['summary' => ['teachers' => $teachers, 'messages' => $messages, 'cashflow' => $cashflow]]);
    }

    public function teacher(array $user, int $id, string $method, array $payload): never
    {
        $this->requireAdmin($user);
        if ($method === 'DELETE') {
            $query = $this->pdo->prepare("DELETE FROM users WHERE id=? AND role='teacher'");
            $query->execute([$id]);
            $this->response->json(['message' => 'Teacher account deleted']);
        }
        if ($method === 'GET') {
            $query = $this->pdo->prepare('SELECT u.id,u.name,u.email,u.role,u.status,u.created_at,p.phone,p.school_name,p.staff_id,p.national_id,p.birth_date,p.profile_photo_path,p.verification_status FROM users u LEFT JOIN teacher_profiles p ON p.user_id=u.id WHERE u.id=?');
            $query->execute([$id]);
            $teacher = $query->fetch();
            if (!$teacher) $this->response->json(['error' => 'User not found'], 404);
            $docs = $this->pdo->prepare('SELECT id,document_type,file_path,original_name,mime_type,size_bytes,created_at FROM teacher_documents WHERE user_id=?');
            $docs->execute([$id]);
            $teacher['documents'] = $docs->fetchAll();
            $teacher['teacher_profile'] = array_intersect_key($teacher, array_flip(['phone', 'school_name', 'staff_id', 'national_id', 'birth_date', 'profile_photo_path', 'verification_status']));
            $this->response->json(['teacher' => $teacher]);
        }

        if (isset($payload['status']) && !in_array($payload['status'], ['pending', 'active', 'suspended'], true)) {
            $this->response->json(['error' => 'Invalid account status'], 422);
        }
        $exists = $this->pdo->prepare('SELECT id FROM users WHERE id=?');
        $exists->execute([$id]);
        if (!$exists->fetchColumn()) {
            $this->response->json(['error' => 'User not found'], 404);
        }
        if (isset($payload['status'])) {
            $query = $this->pdo->prepare('UPDATE users SET status=? WHERE id=?');
            $query->execute([$payload['status'], $id]);
        }

        $profileFields = ['phone', 'school_name', 'staff_id', 'national_id', 'birth_date'];
        $updates = [];
        $values = [];
        foreach ($profileFields as $field) {
            if (array_key_exists($field, $payload)) {
                $updates[] = "{$field}=?";
                $values[] = trim((string)$payload[$field]) ?: null;
            }
        }
        if ($updates) {
            $profile = $this->pdo->prepare('INSERT INTO teacher_profiles (user_id) VALUES (?) ON CONFLICT (user_id) DO NOTHING');
            $profile->execute([$id]);
            $values[] = $id;
            $query = $this->pdo->prepare('UPDATE teacher_profiles SET ' . implode(', ', $updates) . ', updated_at=CURRENT_TIMESTAMP WHERE user_id=?');
            $query->execute($values);
        }
        $this->log((int)$user['id'], $id, 'teacher.updated', 'user', $id, $payload);
        $this->response->json(['message' => 'User account updated']);
    }

    public function teacherDocument(array $user, int $teacherId, int $documentId): never
    {
        $this->requireAdmin($user);
        $query = $this->pdo->prepare('SELECT file_path, original_name FROM teacher_documents WHERE id=? AND user_id=?');
        $query->execute([$documentId, $teacherId]);
        $document = $query->fetch(PDO::FETCH_ASSOC);
        if (!$document || !preg_match('~\Auploads/document/[a-f0-9]{48}\.(jpg|png|pdf)\z~D', (string)$document['file_path'], $match)) {
            $this->response->json(['error' => 'Document not found'], 404);
        }

        $mimeType = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'pdf' => 'application/pdf'][$match[1]];
        $path = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, (string)$document['file_path']);
        if (!is_file($path)) {
            $this->response->json(['error' => 'Document file not found'], 404);
        }

        $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', basename((string)$document['original_name'])) ?: 'document';
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . (string)filesize($path));
        header('Content-Disposition: inline; filename="' . $filename . '"');
        header('Cache-Control: private, no-store');
        header('X-Content-Type-Options: nosniff');
        readfile($path);
        exit;
    }

    public function content(array $user, array $payload, string $method = 'PUT'): never
    {
        $this->requireAdmin($user);
        if ($method === 'GET') {
            $this->response->json(['content' => $this->pdo->query('SELECT page_key, content_key, content_value, updated_at FROM content ORDER BY page_key, content_key')->fetchAll()]);
        }
        $pageKey = (string)($payload['page_key'] ?? 'home');
        $previousContent = $this->content->page($pageKey);
        $this->content->update($pageKey, $payload['content'] ?? []);
        foreach (Upload::pathsInContent($previousContent) as $path) {
            Upload::deleteIfUnreferenced($this->pdo, $path);
        }
        $this->log((int)$user['id'], null, 'content.updated', 'content', null, ['page_key' => $pageKey]);
        $this->response->json(['message' => 'Content updated']);
    }

    public function messages(array $user): never
    {
        $this->requireAdmin($user);
        $messages = $this->pdo->query(
            'SELECT m.*, COALESCE(m.user_id, sender.id) AS sender_user_id,
                    COALESCE(sender.name, m.name) AS sender_name,
                    COALESCE(sender.email, m.email) AS sender_email,
                    sender.role AS sender_role
             FROM contact_messages m
             LEFT JOIN users sender ON sender.id = m.user_id
             ORDER BY m.created_at DESC, m.id DESC'
        )->fetchAll();
        $this->response->json(['messages' => $messages]);
    }

    public function updateMessageStatus(array $user, int $id, array $payload): never
    {
        $this->requireAdmin($user);
        $status = $payload['status'] ?? null;
        if (!in_array($status, ['read', 'unread'], true)) {
            $this->response->json(['error' => 'Status must be read or unread'], 422);
        }

        $query = $this->pdo->prepare('UPDATE contact_messages SET status = ? WHERE id = ?');
        $query->execute([$status, $id]);
        if ($query->rowCount() === 0) {
            $exists = $this->pdo->prepare('SELECT 1 FROM contact_messages WHERE id = ?');
            $exists->execute([$id]);
            if ($exists->fetchColumn() === false) {
                $this->response->json(['error' => 'Message not found'], 404);
            }
        }

        $this->response->json(['message' => 'Message status updated', 'status' => $status]);
    }

    public function notify(array $user, array $payload): never
    {
        $this->requireAdmin($user);
        $query = $this->pdo->prepare('INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)');
        $query->execute([(int)$payload['user_id'], trim($payload['title'] ?? ''), trim($payload['message'] ?? '')]);
        $this->response->json(['message' => 'Notification sent'], 201);
    }

    public function notifications(array $user): never
    {
        $this->requireAdmin($user);
        $this->response->json(['notifications' => $this->pdo->query('SELECT n.*, u.name, u.email FROM notifications n JOIN users u ON u.id=n.user_id ORDER BY n.created_at DESC')->fetchAll()]);
    }

    public function deleteNotification(array $user, int $id): never
    {
        $this->requireAdmin($user);
        $q = $this->pdo->prepare('DELETE FROM notifications WHERE id = ?');
        $q->execute([$id]);
        $this->response->json(['message' => 'Notification deleted']);
    }

    public function activities(array $user): never
    {
        $this->requireAdmin($user);
        $this->response->json(['activities' => $this->pdo->query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 500')->fetchAll()]);
    }

    public function paymentHistory(array $user, ?int $userId = null): never
    {
        $this->requireAdmin($user);
        $sql = 'SELECT p.*, u.name, u.email FROM payments p JOIN users u ON u.id=p.user_id';
        $params = [];
        if ($userId) {
            $sql .= ' WHERE p.user_id = ?';
            $params = [$userId];
        }
        $sql .= ' ORDER BY p.created_at DESC';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $this->response->json(['payments' => $stmt->fetchAll()]);
    }

    public function plans(array $user, string $method, array $payload, ?int $id = null): never
    {
        $this->requireAdmin($user);
        if ($method === 'GET') $this->response->json(['plans' => $this->pdo->query('SELECT * FROM plans ORDER BY amount')->fetchAll()]);
        if ($method === 'DELETE' && $id) {
            $q = $this->pdo->prepare('UPDATE plans SET active=0 WHERE id=?'); $q->execute([$id]);
            $this->response->json(['message' => 'Plan archived']);
        }
        $name = trim((string)($payload['name'] ?? '')); $amount = (float)($payload['amount'] ?? -1);
        if ($name === '' || $amount < 0) $this->response->json(['error' => 'Plan name and amount are required'], 422);
        if ($id) {
            $q = $this->pdo->prepare('UPDATE plans SET name=?, amount=?, cadence=?, description=?, benefits=?, active=? WHERE id=?');
            $q->execute([$name, $amount, $payload['cadence'] ?? 'Monthly', $payload['description'] ?? '', json_encode($payload['benefits'] ?? []), (int)($payload['active'] ?? 1), $id]);
        } else {
            $q = $this->pdo->prepare('INSERT INTO plans (name, amount, cadence, description, benefits, active) VALUES (?, ?, ?, ?, ?, ?)');
            $q->execute([$name, $amount, $payload['cadence'] ?? 'Monthly', $payload['description'] ?? '', json_encode($payload['benefits'] ?? []), (int)($payload['active'] ?? 1)]);
        }
        $this->response->json(['message' => 'Plan saved'], 201);
    }

    public function uploadCmsAsset(array $user, array $files): never
    {
        $this->requireAdmin($user);
        if (!isset($files['asset'])) {
            $this->response->json(['error' => 'No asset file uploaded'], 422);
        }
        $saved = Upload::save($files['asset'], 'cms');
        $this->log((int)$user['id'], null, 'cms.upload', 'asset', null, ['path' => $saved['path']]);
        $this->response->json(['path' => $saved['path']]);
    }

    private function log(int $actor, ?int $subject, string $action, ?string $entity, ?int $entityId, array $metadata = []): void
    {
        $q = $this->pdo->prepare('INSERT INTO activity_logs (user_id, actor_user_id, action, entity_type, entity_id, metadata, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $q->execute([$subject, $actor, $action, $entity, $entityId, json_encode($metadata), $_SERVER['REMOTE_ADDR'] ?? null]);
    }
}
