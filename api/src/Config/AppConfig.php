<?php
declare(strict_types=1);

namespace TiFund\Config;

final class AppConfig
{
    public function __construct(private readonly array $values)
    {
    }

    public function get(string $key, string $default = ''): string
    {
        return (string)($this->values[$key] ?? $default);
    }

    public function environment(): string
    {
        return $this->get('APP_ENV');
    }

    public function apiSecret(): string
    {
        return $this->get('API_SECRET', 'local-secret');
    }
}
