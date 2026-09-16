<?php
declare(strict_types=1);

namespace TiFund\Database;

use PDO;

final class Schema
{
    public function __construct(private readonly PDO $pdo)
    {
    }

    public function bootstrap(): void
    {
        $tables = [
            "CREATE TABLE IF NOT EXISTS users (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, google_id VARCHAR(191) UNIQUE NOT NULL, name VARCHAR(190) NOT NULL, email VARCHAR(190) UNIQUE NOT NULL, role ENUM('teacher','admin') NOT NULL DEFAULT 'teacher', status ENUM('pending','active','suspended') NOT NULL DEFAULT 'active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS teacher_profiles (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED UNIQUE NOT NULL, phone VARCHAR(40) NULL, school_name VARCHAR(190) NULL, staff_id VARCHAR(100) NULL, national_id VARCHAR(120) NULL, birth_date DATE NULL, profile_photo_path VARCHAR(255) NULL, verification_status ENUM('pending','verified','rejected') DEFAULT 'pending', updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS identity_documents (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, document_type VARCHAR(60) NOT NULL, file_name VARCHAR(255) NOT NULL, mime_type VARCHAR(100) NOT NULL, file_data MEDIUMBLOB NULL, file_path VARCHAR(255) NULL, size_bytes INT UNSIGNED NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_identity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS activity_logs (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL, actor_user_id BIGINT UNSIGNED NULL, action VARCHAR(120) NOT NULL, entity_type VARCHAR(80) NULL, entity_id BIGINT UNSIGNED NULL, metadata JSON NULL, ip_address VARCHAR(45) NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_activity_user (user_id, created_at), CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL, CONSTRAINT fk_activity_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS teacher_documents (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, document_type ENUM('national_id','birth_certificate','teacher_certificate') NOT NULL, file_path VARCHAR(255) NOT NULL, original_name VARCHAR(255) NOT NULL, mime_type VARCHAR(100) NOT NULL, size_bytes INT UNSIGNED NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_teacher_documents_user (user_id), CONSTRAINT fk_teacher_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS plans (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL, amount DECIMAL(12,2) NOT NULL, cadence VARCHAR(40) NOT NULL, description TEXT NOT NULL, benefits JSON NULL, active TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS payments (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, plan_id BIGINT UNSIGNED NULL, reference VARCHAR(191) UNIQUE NOT NULL, amount DECIMAL(12,2) NOT NULL, currency CHAR(3) DEFAULT 'GHS', status VARCHAR(40) NOT NULL, gateway_response JSON NULL, paid_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS content (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, page_key VARCHAR(60) NOT NULL, content_key VARCHAR(100) NOT NULL, content_value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY page_content (page_key, content_key)) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS contact_messages (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(190) NOT NULL, email VARCHAR(190) NOT NULL, message TEXT NOT NULL, status VARCHAR(30) DEFAULT 'unread', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
            "CREATE TABLE IF NOT EXISTS notifications (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, title VARCHAR(190) NOT NULL, message TEXT NOT NULL, read_at TIMESTAMP NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB",
        ];
        foreach ($tables as $sql) {
            $this->pdo->exec($sql);
        }
        $this->ensureColumn('teacher_profiles', 'national_id', 'VARCHAR(120) NULL');
        $this->ensureColumn('teacher_profiles', 'birth_date', 'DATE NULL');
        $this->ensureColumn('teacher_profiles', 'profile_photo_path', 'VARCHAR(255) NULL');
        $this->ensureColumn('identity_documents', 'file_path', 'VARCHAR(255) NULL');
        $this->ensureColumn('identity_documents', 'size_bytes', 'INT UNSIGNED NULL');
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM plans')->fetchColumn() === 0) {
            $insert = $this->pdo->prepare('INSERT INTO plans (name, amount, cadence, description, benefits) VALUES (?, ?, ?, ?, ?)');
            $plans = [
                ['Starter Saver', 100, 'Monthly', 'A simple beginning for consistent saving.', ['Flexible monthly deposits', 'Quarterly statements', 'Member support']],
                ['Growth Builder', 300, 'Monthly', 'Grow your balance with a stronger contribution plan.', ['Everything in Starter', 'Annual bonus review', 'Priority support']],
                ['Executive Future', 600, 'Monthly', 'A focused plan for long-term financial goals.', ['Everything in Growth', 'Personal account review', 'Retirement planning session']],
            ];
            foreach ($plans as $plan) {
                $insert->execute([$plan[0], $plan[1], $plan[2], $plan[3], json_encode($plan[4])]);
            }
        }
        if ((int)$this->pdo->query('SELECT COUNT(*) FROM content')->fetchColumn() === 0) {
            $content = $this->pdo->prepare('INSERT INTO content (page_key, content_key, content_value) VALUES (?, ?, ?)');
            $seed = [
                ['home', 'hero_title', 'A stronger financial future starts today.'],
                ['home', 'hero_text', 'TiFund helps teachers in Kumasi and across Ghana build disciplined savings, track investments, and plan with confidence.'],
                ['home', 'stats', 'Teacher-led savings · Kumasi, Ashanti Region'],
                ['carousel', 'slides', json_encode([
                    ['title' => 'Save with purpose', 'text' => 'Build a reliable contribution habit with a plan that fits your teaching journey.'],
                    ['title' => 'Track every cedi', 'text' => 'See payment references, timestamps, and account progress in one dashboard.'],
                    ['title' => 'Plan with confidence', 'text' => 'Make informed decisions with clear records and practical member support.'],
                ])],
                ['faq', 'items', json_encode([
                    ['question' => 'Who can join TiFund?', 'answer' => 'Teachers and education professionals in Ghana who complete the required verification process.'],
                    ['question' => 'Where is TiFund based?', 'answer' => 'TiFund is based in Kumasi and serves teachers across Ghana.'],
                ])],
                ['workers', 'team', json_encode([
                    ['name' => 'Member Services Team', 'role' => 'Teacher support', 'bio' => 'Helping members keep their records and contributions organized.'],
                    ['name' => 'Investment Operations Team', 'role' => 'Account operations', 'bio' => 'Maintaining transparent payment and activity records.'],
                ])],
            ];
            foreach ($seed as $row) $content->execute($row);
        }
    }

    public function tableExists(string $table): bool
    {
        $query = $this->pdo->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?');
        $query->execute([$table]);
        return (int)$query->fetchColumn() === 1;
    }

    private function ensureColumn(string $table, string $column, string $definition): void
    {
        $q = $this->pdo->prepare('SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?');
        $q->execute([$table, $column]);
        if ((int)$q->fetchColumn() === 0) {
            $this->pdo->exec("ALTER TABLE `{$table}` ADD COLUMN `{$column}` {$definition}");
        }
    }
}
