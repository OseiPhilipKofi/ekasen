<?php
declare(strict_types=1);

namespace TiFund\Http;

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
}
