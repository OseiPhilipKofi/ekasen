<?php
declare(strict_types=1);

namespace TiFund\Http;

final class Response
{
    public function __construct()
    {
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: no-referrer');
    }

    public function json(array $body, int $status = 200): never
    {
        http_response_code($status);
        echo json_encode($body, JSON_UNESCAPED_SLASHES);
        exit;
    }

    public function cors(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedStr = $_ENV['FRONTEND_URLS'] ?? ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173');
        $allowed = array_filter(array_map('trim', explode(',', $allowedStr)));

        if (in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
        } else {
            // Fallback for development if no origin is sent or doesn't match exactly
            header('Access-Control-Allow-Origin: http://localhost:5173');
        }

        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Vary: Origin');
    }
}
