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
        $path = $config->get('DB_PATH', __DIR__ . '/../../database/tifund.sqlite');
        $directory = dirname($path);
        if ($path !== ':memory:' && !is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new \RuntimeException('Unable to create the SQLite database directory.');
        }

        $this->pdo = new PDO('sqlite:' . $path, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $this->pdo->exec('PRAGMA foreign_keys = ON');
        if ($path !== ':memory:') {
            $this->pdo->exec('PRAGMA journal_mode = WAL');
        }
        (new Schema($this->pdo))->bootstrap();
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
