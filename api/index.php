<?php
declare(strict_types=1);

use Dotenv\Dotenv;
use TiFund\Config\AppConfig;
use TiFund\Database\Connection;
use TiFund\Http\Request;
use TiFund\Http\Response;
use TiFund\Router;

require __DIR__ . '/vendor/autoload.php';
Dotenv::createImmutable(__DIR__)->safeLoad();

$config = new AppConfig($_ENV);
$response = new Response();

try {
    (new Router(new Request(), $response, $config, (new Connection($config))->pdo()))->dispatch();
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    $response->json([
        'error' => $config->environment() === 'development' ? $exception->getMessage() : 'Server error',
    ], 500);
}
