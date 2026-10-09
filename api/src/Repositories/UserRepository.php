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
        $this->pdo->beginTransaction();
        try {
            $statement = $this->pdo->prepare('INSERT INTO users (google_id, name, email, role) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING');
            $statement->execute([$googleId, $name, $email, $role]);

            $query = $this->pdo->prepare('SELECT id, google_id FROM users WHERE google_id = ?');
            $query->execute([$googleId]);
            $existing = $query->fetch();
            if (!$existing) {
                $query = $this->pdo->prepare('SELECT id, google_id FROM users WHERE email = ?');
                $query->execute([$email]);
                $existing = $query->fetch();
            }
            if (!$existing) {
                throw new \RuntimeException('Unable to locate the account after sign-in.');
            }

            if ($existing['google_id'] !== $googleId && (str_starts_with($existing['google_id'], 'registration:') || str_starts_with($existing['google_id'], 'admin:'))) {
                $update = $this->pdo->prepare('UPDATE users SET google_id = ? WHERE id = ?');
                $update->execute([$googleId, $existing['id']]);
            }

            $profile = $this->pdo->prepare('INSERT INTO teacher_profiles (user_id) VALUES (?) ON CONFLICT (user_id) DO NOTHING');
            $profile->execute([$existing['id']]);
            $this->pdo->commit();
        } catch (\Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $exception;
        }

        return $this->findAccount((int)$existing['id']);
    }

    public function findByToken(string $token, string $secret): ?array
    {
        $users = $this->pdo->query('SELECT id, name, email, role, status FROM users')->fetchAll();
        foreach ($users as $user) {
            if ($user['status'] === 'active' && hash_equals(hash_hmac('sha256', (string)$user['id'], $secret), $token)) {
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

    private function findAccount(int $id): array
    {
        $query = $this->pdo->prepare('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?');
        $query->execute([$id]);
        $account = $query->fetch();
        if (!$account) {
            throw new \RuntimeException('Account could not be loaded after sign-in.');
        }

        $profileQuery = $this->pdo->prepare('SELECT phone, school_name, staff_id, national_id, birth_date, profile_photo_path, verification_status, updated_at FROM teacher_profiles WHERE user_id = ?');
        $profileQuery->execute([$id]);
        $profile = $profileQuery->fetch() ?: [];
        return array_merge($account, $profile, ['teacher_profile' => $profile]);
    }
}
