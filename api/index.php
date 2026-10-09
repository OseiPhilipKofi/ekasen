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

$requestPath = trim((string)parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
if (
    in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET', 'HEAD'], true)
    && preg_match('~^(?:api/)?uploads/(photo|cms)/([a-f0-9]{48})\.(jpg|png|webp)$~D', $requestPath, $image)
) {
    $imagePath = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $image[1]
        . DIRECTORY_SEPARATOR . $image[2] . '.' . $image[3];
    if (!is_file($imagePath)) {
        http_response_code(404);
        exit;
    }
    header('Content-Type: ' . ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'][$image[3]]);
    header('Content-Length: ' . (string)filesize($imagePath));
    header('X-Content-Type-Options: nosniff');
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        readfile($imagePath);
    }
    exit;
}

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
