<?php
declare(strict_types=1);

namespace TiFund\Repositories;

use PDO;

final class UserRepository
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function upsert(string $googleId, string $name, string $email, string $role): array
    {
        $statement = $this->pdo->prepare('INSERT INTO users (google_id, name, email, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role)');
        $statement->execute([$googleId, $name, $email, $role]);
        $query = $this->pdo->prepare('SELECT id, name, email, role, status, created_at FROM users WHERE google_id = ?');
        $query->execute([$googleId]);
        return $query->fetch();
    }

    public function findByToken(string $token, string $secret): ?array
    {
        $users = $this->pdo->query('SELECT id, name, email, role FROM users')->fetchAll();
        foreach ($users as $user) {
            if (hash_equals(hash_hmac('sha256', (string)$user['id'], $secret), $token)) {
                return $user;
            }
        }
        return null;
    }

    public function findAll(): array
    {
        return $this->pdo->query('SELECT * FROM users ORDER BY created_at DESC')->fetchAll();
    }

    public function findByEmail(string $email): ?array
    {
        $q = $this->pdo->prepare('SELECT * FROM users WHERE email = ?');
        $q->execute([$email]);
        return $q->fetch() ?: null;
    }

}
