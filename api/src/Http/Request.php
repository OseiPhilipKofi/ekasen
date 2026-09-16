<?php
declare(strict_types=1);

namespace TiFund\Http;

final class Request
{
    private ?array $payload = null;
    private ?string $raw = null;

    public function method(): string
    {
        return $_SERVER['REQUEST_METHOD'] ?? 'GET';
    }

    public function route(): string
    {
        $path = trim((string)parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
        $path = (string)preg_replace('#^(?:EKASEN/)?(?:api/)?#', '', $path);
        return implode('/', array_values(array_filter(explode('/', $path))));
    }

    public function body(): array
    {
        if ($this->payload === null) {
            $decoded = json_decode($this->rawBody(), true);
            $this->payload = is_array($decoded) ? $decoded : $_POST;
        }
        return $this->payload;
    }

    public function rawBody(): string
    {
        return $this->raw ??= (string)file_get_contents('php://input');
    }

    public function bearerToken(): string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        return preg_match('/Bearer\s+(.+)/i', $header, $matches) ? trim($matches[1]) : '';
    }

    public function header(string $name): string
    {
        return (string)($_SERVER['HTTP_' . strtoupper(str_replace('-', '_', $name))] ?? '');
    }

    public function files(): array
    {
        return $_FILES;
    }
}
