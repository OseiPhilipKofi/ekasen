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
        $query = $this->pdo->prepare("SELECT id, reference, amount, status, CONCAT('Payment ', reference) AS description, created_at FROM payments WHERE user_id=? ORDER BY created_at DESC");
        $query->execute([$userId]);
        return $query->fetchAll();
    }

    public function save(array $payload, int $userId): void
    {
        $query = $this->pdo->prepare('INSERT INTO payments (user_id, plan_id, reference, amount, status, gateway_response, paid_at) VALUES (?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status), gateway_response=VALUES(gateway_response)');
        $query->execute([$userId, $payload['plan_id'] ?? null, $payload['reference'] ?? '', $payload['amount'] ?? 0, 'success', json_encode($payload)]);
    }

    public function markSuccessful(string $reference, array $data): void
    {
        $query = $this->pdo->prepare("UPDATE payments SET status='success', gateway_response=?, paid_at=NOW() WHERE reference=?");
        $query->execute([json_encode($data), $reference]);
    }

    public function account(int $userId): array
    {
        $query = $this->pdo->prepare('SELECT u.id, u.name, u.email, u.status, u.created_at, p.phone, p.school_name, p.staff_id, p.verification_status FROM users u LEFT JOIN teacher_profiles p ON p.user_id=u.id WHERE u.id=?');
        $query->execute([$userId]);
        return $query->fetch() ?: [];
    }

    public function notifications(int $userId): array
    {
        $query = $this->pdo->prepare('SELECT id, title, message, read_at, created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC');
        $query->execute([$userId]);
        return $query->fetchAll();
    }

    public function markNotification(int $userId, int $notificationId): void
    {
        $query = $this->pdo->prepare('UPDATE notifications SET read_at=NOW() WHERE id=? AND user_id=?');
        $query->execute([$notificationId, $userId]);
    }
}
