<?php
declare(strict_types=1);

namespace TiFund\Controllers;

use TiFund\Config\AppConfig;
use TiFund\Http\Request;
use TiFund\Http\Response;
use TiFund\Repositories\PaymentRepository;

final class PaymentController
{
    public function __construct(private readonly PaymentRepository $payments, private readonly AppConfig $config, private readonly Response $response)
    {
    }

    public function history(int $userId): never
    {
        $this->response->json(['history' => $this->payments->history($userId)]);
    }

    public function account(int $userId): never
    {
        $this->response->json(['account' => $this->payments->account($userId)]);
    }

    public function notifications(int $userId): never
    {
        $this->response->json(['notifications' => $this->payments->notifications($userId)]);
    }

    public function markNotification(int $userId, int $notificationId): never
    {
        $this->payments->markNotification($userId, $notificationId);
        $this->response->json(['message' => 'Notification marked as read']);
    }

    public function verify(array $payload, int $userId): never
    {
        $reference = trim((string)($payload['reference'] ?? ''));
        $amount = (float)($payload['amount'] ?? 0);
        if ($reference === '' || $amount <= 0) {
            $this->response->json(['error' => 'A valid payment reference and amount are required'], 422);
        }
        $this->verifyWithPaystack($reference);
        $this->payments->save($payload, $userId);
        $this->response->json(['message' => 'Payment saved']);
    }

    public function webhook(Request $request): never
    {
        $secret = $this->config->get('PAYSTACK_SECRET_KEY');
        $signature = $request->header('X-Paystack-Signature');
        if ($secret === '' || !hash_equals(hash_hmac('sha512', $request->rawBody(), $secret), $signature)) {
            $this->response->json(['error' => 'Invalid webhook signature'], 401);
        }
        $payload = $request->body();
        if (($payload['event'] ?? '') === 'charge.success' && !empty($payload['data']['reference'])) {
            $this->payments->markSuccessful($payload['data']['reference'], $payload['data']);
        }
        $this->response->json(['received' => true]);
    }

    private function verifyWithPaystack(string $reference): void
    {
        $secret = $this->config->get('PAYSTACK_SECRET_KEY');
        if ($secret === '') $this->response->json(['error' => 'Paystack is not configured'], 503);
        $handle = curl_init('https://api.paystack.co/transaction/verify/' . rawurlencode($reference));
        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $secret, 'Cache-Control: no-cache'],
        ]);
        $body = curl_exec($handle);
        $status = curl_getinfo($handle, CURLINFO_HTTP_CODE);
        curl_close($handle);
        $result = is_string($body) ? json_decode($body, true) : null;
        if ($status !== 200 || !is_array($result) || ($result['data']['status'] ?? '') !== 'success') {
            $this->response->json(['error' => 'Payment could not be verified with Paystack'], 422);
        }
    }
}
