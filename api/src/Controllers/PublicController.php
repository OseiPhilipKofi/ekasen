<?php
declare(strict_types=1);

namespace TiFund\Controllers;

use PDO;
use TiFund\Http\Response;
use TiFund\Repositories\ContentRepository;

final class PublicController
{
    public function __construct(private readonly PDO $pdo, private readonly ContentRepository $content, private readonly Response $response)
    {
    }

    public function plans(): never
    {
        $plans = $this->pdo->query('SELECT id, name, amount, cadence, description, benefits FROM plans WHERE active=1 ORDER BY amount')->fetchAll();
        foreach ($plans as &$plan) {
            $plan['benefits'] = json_decode($plan['benefits'] ?? '[]', true);
        }
        $this->response->json(['plans' => $plans]);
    }

    public function home(): never
    {
        $this->response->json(['content' => $this->content->home()]);
    }

    public function contact(array $payload): never
    {
        if (!filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL) || trim($payload['message'] ?? '') === '') {
            $this->response->json(['error' => 'Name, email and message are required'], 422);
        }
        $query = $this->pdo->prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)');
        $query->execute([trim($payload['name'] ?? ''), $payload['email'], trim($payload['message'])]);
        $this->response->json(['message' => 'Contact message received'], 201);
    }

    public function registration(array $payload): never
    {
        $name = trim((string)($payload['name'] ?? ''));
        $email = filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL);
        if ($name === '' || !$email || trim((string)($payload['phone'] ?? '')) === '') {
            $this->response->json(['error' => 'Name, email and phone are required'], 422);
        }
        $query = $this->pdo->prepare('INSERT INTO users (google_id, name, email, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status)');
        $query->execute(['registration:' . hash('sha256', strtolower((string)$email)), $name, $email, 'pending']);
        $userId = (int)$this->pdo->lastInsertId();
        if ($userId === 0) {
            $find = $this->pdo->prepare('SELECT id FROM users WHERE email=?');
            $find->execute([$email]);
            $userId = (int)$find->fetchColumn();
        }
        $profile = $this->pdo->prepare('INSERT INTO teacher_profiles (user_id, phone, school_name, staff_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE phone=VALUES(phone), school_name=VALUES(school_name), staff_id=VALUES(staff_id)');
        $profile->execute([$userId, trim((string)$payload['phone']), trim((string)($payload['school_name'] ?? '')), trim((string)($payload['staff_id'] ?? ''))]);
        $this->response->json(['message' => 'Registration saved', 'user_id' => $userId], 201);
    }
}
