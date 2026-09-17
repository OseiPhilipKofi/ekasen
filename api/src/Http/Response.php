<?php
declare(strict_types=1);

namespace TiFund\Http;

final class Response
{
    public function __construct()
    {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            header('X-Content-Type-Options: nosniff');
            header('X-Frame-Options: DENY');
            header('Referrer-Policy: no-referrer');
        }
    }

    public function json(array $body, int $status = 200): never
    {
        if (ob_get_length()) {
            ob_clean();
        }

        $this->cors();

        http_response_code($status);
        echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        exit;
    }

    public function cors(): void
    {
        if (headers_sent()) {
            return;
        }

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedStr = $_ENV['FRONTEND_URLS'] ?? ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173');
        $allowed = array_filter(array_map('trim', explode(',', $allowedStr)));
        $originHost = parse_url($origin, PHP_URL_HOST) ?? '';

        if (in_array($origin, $allowed, true) || str_ends_with($originHost, '.devtunnels.ms') || str_ends_with($originHost, ".ngrok-free.app")) {
            header('Access-Control-Allow-Origin: ' . $origin);
        } else {
            header('Access-Control-Allow-Origin: http://localhost:5173');
        }

        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Vary: Origin');
    }
}



// <php>
// declare(strict_types=1);

// namespace TiFund\Http;

// final class Response
// {
//     public function __construct()
//     {
//         header('Content-Type: application/json; charset=utf-8');
//         header('X-Content-Type-Options: nosniff');
//         header('X-Frame-Options: DENY');
//         header('Referrer-Policy: no-referrer');
//     }

//     public function json(array $body, int $status = 200): never
//     {
//         // 1. Force CORS headers to fire right before sending the data
//         $this->cors();
//         http_response_code($status);
//         echo json_encode($body, JSON_UNESCAPED_SLASHES);
//         exit;
//     }

//     public function cors(): void
//     {
//         $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
//         $allowedStr = $_ENV['FRONTEND_URLS'] ?? ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173');
//         $allowed = array_filter(array_map('trim', explode(',', $allowedStr)));

//     // Extract the hostname to check for dev tunnels (e.g., xxxx.devtunnels.ms)
//         $originHost = parse_url($origin, PHP_URL_HOST) ?? '';

//         if (in_array($origin, $allowed, true) ||
//             str_ends_with($originHost, '.devtunnels.ms')
//         ) {
//             header('Access-Control-Allow-Origin: ' . $origin);
//         } else {
//             // Fallback for development if no origin is sent or doesn't match exactly
//             header('Access-Control-Allow-Origin: http://localhost:5173');
//         }

//         header('Access-Control-Allow-Headers: Content-Type, Authorization');
//         header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
//         header('Vary: Origin');
//     }
// }
