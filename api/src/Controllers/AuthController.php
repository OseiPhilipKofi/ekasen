<?php
declare(strict_types=1);

namespace TiFund\Controllers;

use TiFund\Config\AppConfig;
use TiFund\Http\Response;
use TiFund\Repositories\UserRepository;

final class AuthController
{
    public function __construct(private readonly UserRepository $users, private readonly AppConfig $config, private readonly Response $response)
    {
    }

    public function google(array $payload): never
    {
        $credential = (string)($payload['credential'] ?? '');
        if ($credential === '') {
            $this->response->json(['error' => 'Google credential is required'], 422);
        }
        $claims = $this->verifyGoogleCredential($credential);
        if (!is_array($claims) || ($claims['iss'] ?? '') !== 'https://accounts.google.com' || ($claims['exp'] ?? 0) < time()) {
            $this->response->json(['error' => 'Expired or invalid Google credential'], 401);
        }
        if ($this->config->get('GOOGLE_CLIENT_ID') !== '' && ($claims['aud'] ?? '') !== $this->config->get('GOOGLE_CLIENT_ID')) {
            $this->response->json(['error' => 'Google credential audience mismatch'], 401);
        }
        $email = filter_var($claims['email'] ?? '', FILTER_VALIDATE_EMAIL);
        if (!$email) {
            $this->response->json(['error' => 'Invalid Google credential'], 401);
        }
        $account = $this->users->upsert((string)($claims['sub'] ?? hash('sha256', $email)), (string)($claims['name'] ?? $email), $email, $email === $this->config->get('GOOGLE_ACCOUNT') ? 'admin' : 'teacher');
        $account['token'] = hash_hmac('sha256', (string)$account['id'], $this->config->apiSecret());
        $this->response->json(['user' => $account]);
    }

    private function verifyGoogleCredential(string $credential): ?array
    {
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($credential);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        // Disabled for local development to avoid CA bundle issues in XAMPP
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $result = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !is_string($result)) {
            return null;
        }

        $claims = json_decode($result, true);
        return is_array($claims) && !isset($claims['error']) ? $claims : null;
    }
}
