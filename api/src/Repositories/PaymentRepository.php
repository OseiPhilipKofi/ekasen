<?php
declare(strict_types=1);

namespace TiFund\Repositories;

use PDO;

final class PaymentRepository
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function history(int $userId): array
    {
        $query = $this->pdo->prepare("SELECT p.id, p.reference, p.amount, p.status, pl.name AS plan_name, 'Payment ' || p.reference AS description, p.created_at FROM payments p LEFT JOIN plans pl ON pl.id = p.plan_id WHERE p.user_id=? ORDER BY p.created_at DESC");
        $query->execute([$userId]);
        return $query->fetchAll();
    }

    public function save(array $payload, int $userId): void
    {
        $query = $this->pdo->prepare("INSERT INTO payments (user_id, plan_id, reference, amount, status, gateway_response, paid_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT (reference) DO UPDATE SET status = excluded.status, gateway_response = excluded.gateway_response, paid_at = excluded.paid_at");
        $query->execute([$userId, $payload['plan_id'] ?? null, $payload['reference'] ?? '', $payload['amount'] ?? 0, 'success', json_encode($payload)]);
    }

    public function markSuccessful(string $reference, array $data): void
    {
        $query = $this->pdo->prepare("UPDATE payments SET status='success', gateway_response=?, paid_at=CURRENT_TIMESTAMP WHERE reference=?");
        $query->execute([json_encode($data), $reference]);
    }

    public function account(int $userId): array
    {
        $query = $this->pdo->prepare('SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, p.phone, p.school_name, p.staff_id, p.national_id, p.birth_date, p.profile_photo_path, p.verification_status FROM users u LEFT JOIN teacher_profiles p ON p.user_id=u.id WHERE u.id=?');
        $query->execute([$userId]);
        $account = $query->fetch() ?: [];
        if ($account) {
            $profile = array_intersect_key($account, array_flip(['phone', 'school_name', 'staff_id', 'national_id', 'birth_date', 'profile_photo_path', 'verification_status']));
            $account['teacher_profile'] = $profile;
        }
        return $account;
    }

    public function notifications(int $userId): array
    {
        $query = $this->pdo->prepare('SELECT id, title, message, read_at, created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC');
        $query->execute([$userId]);
        return $query->fetchAll();
    }

    public function markNotification(int $userId, int $notificationId): void
    {
        $query = $this->pdo->prepare('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?');
        $query->execute([$notificationId, $userId]);
    }
}
