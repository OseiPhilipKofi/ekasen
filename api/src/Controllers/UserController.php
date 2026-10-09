<?php
declare(strict_types=1);

namespace TiFund\Controllers;

use PDO;
use TiFund\Http\Response;
use TiFund\Http\Upload;

final class UserController
{
    public function __construct(private readonly PDO $pdo, private readonly Response $response) {}

    public function profile(array $user, string $method, array $payload, array $files): never
    {
        $id = (int)$user['id'];
        if ($method === 'GET') {
            $this->response->json(['account' => $this->account($id)]);
        }
        if ($method === 'DELETE') {
            $q = $this->pdo->prepare("UPDATE users SET status='suspended', updated_at=CURRENT_TIMESTAMP WHERE id=?");
            $q->execute([$id]);
            $this->response->json(['message' => 'Account deactivated']);
        }

        $allowedFields = ['phone', 'school_name', 'national_id', 'birth_date'];
        if (($user['role'] ?? '') === 'admin') {
            $allowedFields[] = 'staff_id';
        }

        $updates = [];
        $values = [];
        foreach ($allowedFields as $field) {
            if (!array_key_exists($field, $payload)) {
                continue;
            }
            $value = trim((string)$payload[$field]);
            if ($field === 'birth_date' && $value !== '') {
                $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
                if (!$date || $date->format('Y-m-d') !== $value) {
                    $this->response->json(['error' => 'Birth date must use YYYY-MM-DD format'], 422);
                }
            }
            $updates[] = "{$field}=?";
            $values[] = $value === '' ? null : $value;
        }

        $savedPhoto = null;
        $previousPhotoPath = null;
        if (isset($files['profile_photo'])) {
            $photo = $this->pdo->prepare('SELECT profile_photo_path FROM teacher_profiles WHERE user_id=?');
            $photo->execute([$id]);
            $previousPhotoPath = $photo->fetchColumn();
            $previousPhotoPath = is_string($previousPhotoPath) ? $previousPhotoPath : null;
            $savedPhoto = Upload::save($files['profile_photo'], 'photo');
            $updates[] = 'profile_photo_path=?';
            $values[] = $savedPhoto['path'];
        }
        if (!$updates) {
            $this->response->json(['error' => 'Provide at least one editable profile field'], 422);
        }

        $profile = $this->pdo->prepare('INSERT INTO teacher_profiles (user_id) VALUES (?) ON CONFLICT (user_id) DO NOTHING');
        $values[] = $id;
        $query = $this->pdo->prepare('UPDATE teacher_profiles SET ' . implode(', ', $updates) . ', updated_at=CURRENT_TIMESTAMP WHERE user_id=?');
        try {
            $profile->execute([$id]);
            $query->execute($values);
        } catch (\Throwable $error) {
            if ($savedPhoto !== null) {
                Upload::deleteIfUnreferenced($this->pdo, $savedPhoto['path']);
            }
            throw $error;
        }

        $log = $this->pdo->prepare('INSERT INTO activity_logs (user_id,actor_user_id,action,metadata,ip_address) VALUES (?,?,?,?,?)');
        $log->execute([$id, $id, 'profile.updated', json_encode(['fields' => array_keys(array_intersect_key($payload, array_flip($allowedFields))), 'photo_updated' => $savedPhoto !== null]), $_SERVER['REMOTE_ADDR'] ?? null]);
        if ($savedPhoto !== null && $previousPhotoPath !== $savedPhoto['path']) {
            Upload::deleteIfUnreferenced($this->pdo, $previousPhotoPath);
        }
        $this->response->json(['message' => 'Account updated', 'account' => $this->account($id)]);
    }

    public function activities(array $user): never
    {
        $q = $this->pdo->prepare('SELECT id, action, entity_type, entity_id, metadata, created_at FROM activity_logs WHERE user_id=? OR actor_user_id=? ORDER BY created_at DESC LIMIT 200');
        $q->execute([(int)$user['id'], (int)$user['id']]);
        $this->response->json(['activities' => $q->fetchAll()]);
    }

    public function messages(array $user): never
    {
        $query = $this->pdo->prepare(
            'SELECT id, name, email, phone, subject, message, status, created_at
             FROM contact_messages
             WHERE user_id = ?
             ORDER BY created_at DESC, id DESC'
        );
        $query->execute([(int)$user['id']]);
        $this->response->json(['messages' => $query->fetchAll()]);
    }

    private function account(int $id): array
    {
        $query = $this->pdo->prepare('SELECT u.id,u.name,u.email,u.role,u.status,u.created_at,p.phone,p.school_name,p.staff_id,p.national_id,p.birth_date,p.profile_photo_path,p.verification_status FROM users u LEFT JOIN teacher_profiles p ON p.user_id=u.id WHERE u.id=?');
        $query->execute([$id]);
        $account = $query->fetch() ?: [];
        if ($account) {
            $account['teacher_profile'] = array_intersect_key($account, array_flip(['phone', 'school_name', 'staff_id', 'national_id', 'birth_date', 'profile_photo_path', 'verification_status']));
        }
        return $account;
    }
}
