<?php
declare(strict_types=1);

namespace TiFund\Database;

use PDO;
use TiFund\Config\AppConfig;

final class Connection
{
    private PDO $pdo;

    public function __construct(AppConfig $config)
    {
        $host = $config->get('DB_HOST', 'localhost');
        $port = $config->get('DB_PORT', '3306');
        $user = $config->get('DB_USER');
        $pass = $config->get('DB_PASSWORD');
        $name = $config->get('DB_NAME', 'tifund');
        if (!preg_match('/^[A-Za-z0-9_]+$/', $name)) {
            throw new InvalidArgumentException('Invalid database name configuration.');
        }
        $options = [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION];
        $server = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, $options);
        $server->exec("CREATE DATABASE IF NOT EXISTS `{$name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $this->pdo = new PDO(
            "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
            $user,
            $pass,
            $options + [PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
        (new Schema($this->pdo))->bootstrap();
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
