<?php
declare(strict_types=1);

namespace TiFund\Http;

use PDO;
use RuntimeException;

final class Upload
{
    public static function save(array $file, string $kind): array
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file((string)($file['tmp_name'] ?? ''))) {
            throw new RuntimeException('Invalid upload');
        }
        $limits = ['photo' => 5 * 1024 * 1024, 'document' => 10 * 1024 * 1024];
        $allowed = $kind === 'photo'
            ? ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp']
            : ['application/pdf' => 'pdf', 'image/jpeg' => 'jpg', 'image/png' => 'png'];
        $size = (int)$file['size'];
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = (string)$finfo->file((string)$file['tmp_name']);
        if ($size < 1 || $size > ($limits[$kind] ?? $limits['document']) || !isset($allowed[$mime])) {
            throw new RuntimeException('Unsupported or oversized upload');
        }
        $root = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads';
        $directory = $root . DIRECTORY_SEPARATOR . $kind;
        if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('Upload storage unavailable');
        }
        $name = bin2hex(random_bytes(24)) . '.' . $allowed[$mime];
        $path = $directory . DIRECTORY_SEPARATOR . $name;
        if (!move_uploaded_file((string)$file['tmp_name'], $path)) {
            throw new RuntimeException('Could not store upload');
        }
        @chmod($path, 0600);
        return ['path' => 'uploads/' . $kind . '/' . $name, 'original_name' => basename((string)$file['name']), 'mime_type' => $mime, 'size_bytes' => $size];
    }
    public static function pathsInContent(array $content): array
    {
        $paths = [];
        foreach ($content as $value) {
            if (!is_string($value)) {
                continue;
            }
            $value = str_replace('\\/', '/', $value);
            preg_match_all('~uploads/(?:photo|document|cms)/[a-f0-9]{48}\.(?:jpg|png|webp|pdf)~', $value, $matches);
            foreach ($matches[0] as $path) {
                $paths[$path] = true;
            }
        }
        return array_keys($paths);
    }

    public static function deleteIfUnreferenced(PDO $pdo, ?string $relativePath): bool
    {
        if (!$relativePath || !preg_match('~\Auploads/(?:photo|document|cms)/[a-f0-9]{48}\.(?:jpg|png|webp|pdf)\z~', $relativePath)) {
            return false;
        }

        $references = $pdo->prepare(
            'SELECT 1 FROM teacher_profiles WHERE profile_photo_path = ?
             UNION ALL SELECT 1 FROM teacher_documents WHERE file_path = ?
             UNION ALL SELECT 1 FROM identity_documents WHERE file_path = ?
             UNION ALL SELECT 1 FROM content
             WHERE instr(content_value, ?) > 0 OR instr(content_value, ?) > 0
             LIMIT 1'
        );
        $references->execute([
            $relativePath,
            $relativePath,
            $relativePath,
            $relativePath,
            str_replace('/', '\\/', $relativePath),
        ]);
        if ($references->fetchColumn() !== false) {
            return false;
        }

        $segments = explode('/', $relativePath);
        $path = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . implode(DIRECTORY_SEPARATOR, $segments);
        if (!is_file($path)) {
            return false;
        }
        if (!unlink($path)) {
            throw new RuntimeException('Could not delete replaced upload');
        }
        return true;
    }
}
