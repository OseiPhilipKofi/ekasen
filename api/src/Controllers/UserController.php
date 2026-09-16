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
            $q = $this->pdo->prepare('SELECT u.id,u.name,u.email,u.status,u.created_at,p.phone,p.school_name,p.staff_id,p.national_id,p.birth_date,p.profile_photo_path,p.verification_status FROM users u LEFT JOIN teacher_profiles p ON p.user_id=u.id WHERE u.id=?');
            $q->execute([$id]);
            $this->response->json(['account' => $q->fetch() ?: []]);
        }
        if ($method === 'DELETE') {
            $q = $this->pdo->prepare('UPDATE users SET status="suspended" WHERE id=?');
            $q->execute([$id]);
            $this->response->json(['message' => 'Account deactivated']);
        }

        // For PUT/POST requests, perform update
        $phone = trim((string)($payload['phone'] ?? ''));
        if ($phone === '' && !isset($files['profile_photo'])) {
            $this->response->json(['error' => 'Phone number or profile photo is required for updates'], 422);
        }

        if ($phone !== '') {
            $p = $this->pdo->prepare('INSERT INTO teacher_profiles (user_id, phone) VALUES (?, ?) ON DUPLICATE KEY UPDATE phone=VALUES(phone)');
            $p->execute([$id, $phone]);
        }

        if (isset($files['profile_photo'])) {
            $saved = Upload::save($files['profile_photo'], 'photo');
            $q = $this->pdo->prepare('UPDATE teacher_profiles SET profile_photo_path=? WHERE user_id=?'); $q->execute([$saved['path'], $id]);
        }
        $q = $this->pdo->prepare('INSERT INTO activity_logs (user_id,actor_user_id,action,metadata,ip_address) VALUES (?,?,?,?,?)');
        $q->execute([$id, $id, 'profile.updated', json_encode(['phone' => $phone]), $_SERVER['REMOTE_ADDR'] ?? null]);
        $this->response->json(['message' => 'Account updated']);
    }

    public function activities(array $user): never
    {
        $q = $this->pdo->prepare('SELECT id, action, entity_type, entity_id, metadata, created_at FROM activity_logs WHERE user_id=? OR actor_user_id=? ORDER BY created_at DESC LIMIT 200');
        $q->execute([(int)$user['id'], (int)$user['id']]);
        $this->response->json(['activities' => $q->fetchAll()]);
    }
}
