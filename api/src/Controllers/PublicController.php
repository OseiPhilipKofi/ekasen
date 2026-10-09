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

    public function contentPage(string $page): never
    {
        $this->response->json(['content' => $this->content->page($page)]);
    }

    public function contact(array $payload): never
    {
        $name = trim((string)($payload['name'] ?? ''));
        $email = filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL);
        $message = trim((string)($payload['message'] ?? ''));
        if ($name === '' || !$email || $message === '') {
            $this->response->json(['error' => 'Name, email and message are required'], 422);
        }
        $query = $this->pdo->prepare('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)');
        $query->execute([
            $name,
            $email,
            trim((string)($payload['phone'] ?? '')) ?: null,
            trim((string)($payload['subject'] ?? '')) ?: null,
            $message,
        ]);
        $this->response->json(['message' => 'Contact message received'], 201);
    }

    public function registration(array $payload): never
    {
        $name = trim((string)($payload['name'] ?? ''));
        $email = filter_var($payload['email'] ?? '', FILTER_VALIDATE_EMAIL);
        if ($name === '' || !$email || trim((string)($payload['phone'] ?? '')) === '') {
            $this->response->json(['error' => 'Name, email and phone are required'], 422);
        }
        $query = $this->pdo->prepare("INSERT INTO users (google_id, name, email, status) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING");
        $query->execute(['registration:' . hash('sha256', strtolower((string)$email)), $name, $email, 'pending']);
        $find = $this->pdo->prepare('SELECT id FROM users WHERE email = ?');
        $find->execute([$email]);
        $userId = (int)$find->fetchColumn();
        if ($userId === 0) {
            throw new \RuntimeException('Registration account could not be loaded after saving.');
        }
        $profile = $this->pdo->prepare('INSERT INTO teacher_profiles (user_id, phone, school_name, staff_id) VALUES (?, ?, ?, ?) ON CONFLICT (user_id) DO UPDATE SET phone = excluded.phone, school_name = excluded.school_name');
        $profile->execute([$userId, trim((string)$payload['phone']), trim((string)($payload['school_name'] ?? '')), trim((string)($payload['staff_id'] ?? ''))]);
        $this->response->json(['message' => 'Registration saved', 'user_id' => $userId], 201);
    }
}
