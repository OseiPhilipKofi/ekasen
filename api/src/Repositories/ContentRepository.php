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
        $content = $this->page('home');
        $legacySections = [
            'carousel' => ['page' => 'carousel', 'key' => 'slides'],
            'workers' => ['page' => 'workers', 'key' => 'team'],
            'faq' => ['page' => 'faq', 'key' => 'items'],
        ];
        foreach ($legacySections as $target => $source) {
            if (isset($content[$target])) {
                continue;
            }
            $legacy = $this->page($source['page'])[$source['key']] ?? null;
            $items = is_string($legacy) ? json_decode($legacy, true) : null;
            if (!is_array($items)) {
                continue;
            }
            if ($target === 'carousel') {
                $items = array_map(static function (array $item): array {
                    $item['desc'] = $item['desc'] ?? $item['text'] ?? '';
                    return $item;
                }, $items);
            } elseif ($target === 'faq') {
                $items = array_map(static function (array $item): array {
                    $item['q'] = $item['q'] ?? $item['question'] ?? '';
                    $item['a'] = $item['a'] ?? $item['answer'] ?? '';
                    return $item;
                }, $items);
            }
            $content[$target] = json_encode($items);
        }
        return $content;
    }

    public function page(string $page): array
    {
        $query = $this->pdo->prepare('SELECT content_key, content_value FROM content WHERE page_key = ?');
        $query->execute([$page]);
        $content = [];
        foreach ($query as $row) {
            $content[$row['content_key']] = $row['content_value'];
        }
        return $content;
    }

    public function update(string $page, array $content): void
    {
        $statement = $this->pdo->prepare('INSERT INTO content (page_key, content_key, content_value) VALUES (?, ?, ?) ON CONFLICT (page_key, content_key) DO UPDATE SET content_value = excluded.content_value, updated_at = CURRENT_TIMESTAMP');
        foreach ($content as $key => $value) {
            $statement->execute([$page, $key, (string)$value]);
        }
    }
}
