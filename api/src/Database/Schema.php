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
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                google_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
                status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS teacher_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                phone TEXT,
                school_name TEXT,
                staff_id TEXT,
                national_id TEXT,
                birth_date TEXT,
                profile_photo_path TEXT,
                verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )",
            "CREATE TABLE IF NOT EXISTS identity_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                document_type TEXT NOT NULL,
                file_name TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                file_data BLOB,
                file_path TEXT,
                size_bytes INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )",
            "CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                actor_user_id INTEGER,
                action TEXT NOT NULL,
                entity_type TEXT,
                entity_id INTEGER,
                metadata TEXT,
                ip_address TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
            )",
            "CREATE TABLE IF NOT EXISTS teacher_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'birth_certificate', 'teacher_certificate')),
                file_path TEXT NOT NULL,
                original_name TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                size_bytes INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )",
            "CREATE TABLE IF NOT EXISTS plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                amount NUMERIC NOT NULL,
                cadence TEXT NOT NULL,
                description TEXT NOT NULL,
                benefits TEXT,
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                plan_id INTEGER,
                reference TEXT UNIQUE NOT NULL,
                amount NUMERIC NOT NULL,
                currency TEXT NOT NULL DEFAULT 'GHS',
                status TEXT NOT NULL,
                gateway_response TEXT,
                paid_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )",
            "CREATE TABLE IF NOT EXISTS content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_key TEXT NOT NULL,
                content_key TEXT NOT NULL,
                content_value TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (page_key, content_key)
            )",
            "CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                subject TEXT,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'unread',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                read_at TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )",
            "CREATE TABLE IF NOT EXISTS app_settings (
                setting_key TEXT PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )",
        ];
        foreach ($tables as $sql) {
            $this->pdo->exec($sql);
        }

        $this->ensureColumn('teacher_profiles', 'national_id', 'TEXT');
        $this->ensureColumn('teacher_profiles', 'birth_date', 'TEXT');
        $this->ensureColumn('teacher_profiles', 'profile_photo_path', 'TEXT');
        $this->ensureColumn('identity_documents', 'file_path', 'TEXT');
        $this->ensureColumn('identity_documents', 'size_bytes', 'INTEGER');
        $this->ensureColumn('contact_messages', 'phone', 'TEXT');
        $this->ensureColumn('contact_messages', 'subject', 'TEXT');

        $planSeed = $this->pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'seed.plans.v2'");
        $planSeed->execute();
        if ($planSeed->fetchColumn() === false) {
            $plans = [
                ['Starter Saver', 100, 'Monthly', 'A simple beginning for consistent saving.', ['Flexible monthly deposits', 'Contribution history in your account', 'Member support']],
                ['Growth Builder', 300, 'Monthly', 'A regular contribution option for members building a savings habit.', ['Monthly contributions', 'Contribution history in your account', 'Member support']],
                ['Executive Future', 600, 'Monthly', 'A higher monthly contribution option for long-term planning.', ['Monthly contributions', 'Contribution history in your account', 'Member support']],
                ['Steady Saver', 150, 'Monthly', 'A manageable monthly contribution option for steady saving.', ['Monthly contributions', 'Contribution history in your account', 'Member support']],
                ['Quarterly Builder', 900, 'Quarterly', 'A quarterly contribution option for members who prefer less frequent payments.', ['Quarterly contributions', 'Contribution history in your account', 'Member support']],
                ['Future Focus', 1200, 'Annual', 'An annual contribution option for members planning ahead.', ['Annual contributions', 'Contribution history in your account', 'Member support']],
            ];
            $this->pdo->beginTransaction();
            try {
                $insert = $this->pdo->prepare('INSERT INTO plans (name, amount, cadence, description, benefits) SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = ?)');
                foreach ($plans as $plan) {
                    $insert->execute([$plan[0], $plan[1], $plan[2], $plan[3], json_encode($plan[4]), $plan[0]]);
                }
                $markSeeded = $this->pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('seed.plans.v2', 'complete')");
                $markSeeded->execute();
                $this->pdo->commit();
            } catch (\Throwable $error) {
                if ($this->pdo->inTransaction()) {
                    $this->pdo->rollBack();
                }
                throw $error;
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
                ['home', 'sponsors', json_encode([])],
                ['services', 'services', json_encode([
                    ['title' => 'Teacher savings plans', 'description' => 'Choose a contribution plan that fits your income and savings goals.'],
                    ['title' => 'Contribution tracking', 'description' => 'Review payment references and contribution history in one account.'],
                    ['title' => 'Member account support', 'description' => 'Keep your contact and teaching profile details up to date.'],
                ])],
                ['contact', 'phone', ''],
                ['contact', 'whatsapp', ''],
                ['contact', 'email', ''],
            ];
            foreach ($seed as $row) {
                $content->execute($row);
            }
        }

        $defaults = $this->pdo->prepare('INSERT INTO content (page_key, content_key, content_value) VALUES (?, ?, ?) ON CONFLICT (page_key, content_key) DO NOTHING');
        $defaults->execute(['services', 'services', json_encode([
            ['title' => 'Teacher savings plans', 'description' => 'Choose a contribution plan that fits your income and savings goals.'],
            ['title' => 'Contribution tracking', 'description' => 'Review payment references and contribution history in one account.'],
            ['title' => 'Member account support', 'description' => 'Keep your contact and teaching profile details up to date.'],
        ])]);
        $defaults->execute(['contact', 'phone', '']);
        $defaults->execute(['contact', 'whatsapp', '']);
        $defaults->execute(['contact', 'email', '']);
        $defaults->execute(['home', 'sponsors', json_encode([])]);

        $serviceSeed = $this->pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'seed.services.v2'");
        $serviceSeed->execute();
        if ($serviceSeed->fetchColumn() === false) {
            $servicesQuery = $this->pdo->prepare("SELECT content_value FROM content WHERE page_key = 'services' AND content_key = 'services'");
            $servicesQuery->execute();
            $services = json_decode((string)$servicesQuery->fetchColumn(), true);
            if (!is_array($services)) {
                $services = [];
            }
            $suggestedServices = [
                ['title' => 'Teacher profile management', 'description' => 'Update your contact details, school information, and staff profile from your account.'],
                ['title' => 'Member document records', 'description' => 'Submit required identity or teaching documents during registration for administrator review.'],
                ['title' => 'Payment history', 'description' => 'Review confirmed contribution references and payment statuses in your member dashboard.'],
            ];
            $existingTitles = array_fill_keys(array_map(
                static fn (array $service): string => trim((string)($service['title'] ?? '')),
                array_filter($services, 'is_array')
            ), true);
            foreach ($suggestedServices as $service) {
                if (!isset($existingTitles[$service['title']])) {
                    $services[] = $service;
                }
            }

            $this->pdo->beginTransaction();
            try {
                $saveServices = $this->pdo->prepare("INSERT INTO content (page_key, content_key, content_value) VALUES ('services', 'services', ?) ON CONFLICT (page_key, content_key) DO UPDATE SET content_value = excluded.content_value, updated_at = CURRENT_TIMESTAMP");
                $saveServices->execute([json_encode($services)]);
                $markSeeded = $this->pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('seed.services.v2', 'complete')");
                $markSeeded->execute();
                $this->pdo->commit();
            } catch (\Throwable $error) {
                if ($this->pdo->inTransaction()) {
                    $this->pdo->rollBack();
                }
                throw $error;
            }
        }
    }

    public function tableExists(string $table): bool
    {
        $query = $this->pdo->prepare("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?");
        $query->execute([$table]);
        return (int)$query->fetchColumn() === 1;
    }

    private function ensureColumn(string $table, string $column, string $definition): void
    {
        if (!preg_match('/^[a-z_]+$/', $table) || !preg_match('/^[a-z_]+$/', $column)) {
            throw new \InvalidArgumentException('Invalid SQLite schema identifier.');
        }
        $columns = $this->pdo->query("PRAGMA table_info(\"{$table}\")")->fetchAll();
        foreach ($columns as $existing) {
            if ($existing['name'] === $column) {
                return;
            }
        }
        $this->pdo->exec("ALTER TABLE \"{$table}\" ADD COLUMN \"{$column}\" {$definition}");
    }
}
