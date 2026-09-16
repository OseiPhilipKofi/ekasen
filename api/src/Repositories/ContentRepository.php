<?php
declare(strict_types=1);

namespace TiFund\Repositories;

use PDO;

final class ContentRepository
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function home(): array
    {
        $query = $this->pdo->prepare("SELECT content_key, content_value FROM content WHERE page_key='home'");
        $query->execute();
        $content = [];
        foreach ($query as $row) {
            $content[$row['content_key']] = $row['content_value'];
        }
        return $content;
    }

    public function update(string $page, array $content): void
    {
        $statement = $this->pdo->prepare('INSERT INTO content (page_key, content_key, content_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content_value=VALUES(content_value)');
        foreach ($content as $key => $value) {
            $statement->execute([$page, $key, (string)$value]);
        }
    }
}
