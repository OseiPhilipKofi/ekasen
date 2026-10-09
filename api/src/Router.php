<?php
declare(strict_types=1);

namespace TiFund;

use PDO;
use TiFund\Config\AppConfig;
use TiFund\Controllers\AdminController;
use TiFund\Controllers\AuthController;
use TiFund\Controllers\PaymentController;
use TiFund\Controllers\PublicController;
use TiFund\Controllers\UserController;
use TiFund\Http\Request;
use TiFund\Http\Response;
use TiFund\Repositories\ContentRepository;
use TiFund\Repositories\PaymentRepository;
use TiFund\Repositories\UserRepository;

final class Router
{
    private readonly AuthController $auth;
    private readonly PublicController $public;
    private readonly PaymentController $payments;
    private readonly AdminController $admin;
    private readonly UserController $userController;

    public function __construct(private readonly Request $request, private readonly Response $response, AppConfig $config, PDO $pdo)
    {
        $users = new UserRepository($pdo);
        $content = new ContentRepository($pdo);
        $this->auth = new AuthController($users, $config, $response);
        $this->public = new PublicController($pdo, $content, $response);
        $this->payments = new PaymentController(new PaymentRepository($pdo), $config, $response);
        $this->admin = new AdminController($pdo, $content, $response);
        $this->userController = new UserController($pdo, $response);
        $this->userRepository = $users;
        $this->config = $config;
    }

    private UserRepository $userRepository;
    private AppConfig $config;

    public function dispatch(): void
    {
        $this->response->cors();
        if ($this->request->method() === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        $route = $this->request->route();
        $method = $this->request->method();
        $payload = $this->request->body();
        if ($route === 'auth/google' && $method === 'POST') $this->auth->google($payload);
        if ($route === 'plans' && $method === 'GET') $this->public->plans();
        if ($route === 'content/home' && $method === 'GET') $this->public->home();
        if (preg_match('#^content/(services|contact)$#', $route, $match) && $method === 'GET') $this->public->contentPage($match[1]);
        if ($route === 'contact' && $method === 'POST') {
            $contactUser = null;
            $contactToken = $this->request->bearerToken();
            if ($contactToken !== '') {
                $contactUser = $this->userRepository->findByToken($contactToken, $this->config->apiSecret());
                if (!$contactUser) $this->response->json(['error' => 'Invalid session'], 401);
            }
            $this->public->contact($payload, $contactUser);
        }
        if ($route === 'registration' && $method === 'POST') $this->public->registration($payload);
        if ($route === 'payments/webhook' && $method === 'POST') $this->payments->webhook($this->request);

        $token = $this->request->bearerToken();
        if ($token === '') $this->response->json(['error' => 'Authentication required'], 401);
        $user = $this->userRepository->findByToken($token, $this->config->apiSecret());
        if (!$user) $this->response->json(['error' => 'Invalid session'], 401);
        if ($route === 'history' && $method === 'GET') $this->payments->history((int)$user['id']);
        if ($route === 'account' && in_array($method, ['GET', 'PUT', 'POST', 'DELETE'], true)) $this->userController->profile($user, $method, $payload, $this->request->files());
        if ($route === 'account/messages' && $method === 'GET') $this->userController->messages($user);
        if ($route === 'notifications' && $method === 'GET') $this->payments->notifications((int)$user['id']);
        if (preg_match('#^notifications/(\d+)/read$#', $route, $match) && $method === 'PUT') $this->payments->markNotification((int)$user['id'], (int)$match[1]);
        if ($route === 'payments/verify' && $method === 'POST') $this->payments->verify($payload, (int)$user['id']);
        if ($route === 'admin/teachers' && $method === 'GET') $this->admin->teachers($user);
        if ($route === 'admin/users' && $method === 'GET') $this->admin->users($user);
        if (in_array($route, ['admin/teachers/register', 'admin/registration'], true) && $method === 'POST') $this->admin->registerTeacher($user, $payload, $this->request->files());
        if ($route === 'admin/summary' && $method === 'GET') $this->admin->summary($user);
        if (preg_match('#^admin/teachers/(\d+)/documents/(\d+)$#', $route, $match) && $method === 'GET') $this->admin->teacherDocument($user, (int)$match[1], (int)$match[2]);
        if (preg_match('#^admin/teachers/(\d+)$#', $route, $match) && in_array($method, ['GET', 'PUT', 'DELETE'], true)) $this->admin->teacher($user, (int)$match[1], $method, $payload);
        if ($route === 'admin/content' && in_array($method, ['GET', 'PUT', 'POST'], true)) $this->admin->content($user, $payload, $method === 'POST' ? 'PUT' : $method);
        if ($route === 'admin/messages' && $method === 'GET') $this->admin->messages($user);
        if (preg_match('#^admin/messages/(\d+)/status$#', $route, $match) && $method === 'PUT') $this->admin->updateMessageStatus($user, (int)$match[1], $payload);
        if ($route === 'admin/notifications' && $method === 'POST') $this->admin->notify($user, $payload);
        if ($route === 'admin/notifications' && $method === 'GET') $this->admin->notifications($user);
        if ($route === 'admin/upload-cms' && $method === 'POST') $this->admin->uploadCmsAsset($user, $this->request->files());
        if (preg_match('#^admin/notifications/(\d+)$#', $route, $match) && $method === 'DELETE') $this->admin->deleteNotification($user, (int)$match[1]);
        if ($route === 'admin/activities' && $method === 'GET') $this->admin->activities($user);
        if ($route === 'admin/payments' && $method === 'GET') $this->admin->paymentHistory($user);
        if (preg_match('#^admin/payments/(\d+)$#', $route, $match) && $method === 'GET') $this->admin->paymentHistory($user, (int)$match[1]);
        if (preg_match('#^admin/plans(?:/(\d+))?$#', $route, $match) && in_array($method, ['GET', 'POST', 'PUT', 'DELETE'], true)) $this->admin->plans($user, $method, $payload, isset($match[1]) ? (int)$match[1] : null);
        if ($route === 'activity' && $method === 'GET') $this->userController->activities($user);
        if ($route === 'activities' && $method === 'GET') $this->userController->activities($user);
        $this->response->json(['error' => 'Route not found'], 404);
    }
}
