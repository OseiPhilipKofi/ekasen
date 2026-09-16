<?php
declare(strict_types=1);

require_once 'vendor/autoload.php';

use TiFund\Config\AppConfig;

// Load configuration manually since we are not in the app context
$config = new AppConfig();
$pdo = new PDO(
    "mysql:host=" . $config->dbHost() . ";dbname=" . $config->dbName(),
    $config->dbUser(),
    $config->dbPass(),
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

echo "Seeding database...\n";

// 1. Create Admin User
$adminEmail = 'admin@tifund.com';
$pdo->prepare('INSERT INTO users (google_id, name, email, role, status) VALUES (?, ?, ?, "admin", "active") ON DUPLICATE KEY UPDATE name=VALUES(name)')
    ->execute(['admin_google_id', 'System Administrator', $adminEmail]);

// 2. Create Teacher Users
$teachers = [
    ['name' => 'John Doe', 'email' => 'john@teacher.com', 'phone' => '0244123456', 'school' => 'Accra Academy', 'staff_id' => 'T001', 'national_id' => 'GHA-123-456'],
    ['name' => 'Jane Smith', 'email' => 'jane@teacher.com', 'phone' => '0200654321', 'school' => 'Wesley Girls', 'staff_id' => 'T002', 'national_id' => 'GHA-789-012'],
    ['name' => 'Kwame Mensah', 'email' => 'kwame@teacher.com', 'phone' => '0555111222', 'school' => 'Achimota School', 'staff_id' => 'T003', 'national_id' => 'GHA-345-678'],
    ['name' => 'Ama Serwaa', 'email' => 'ama@teacher.com', 'phone' => '0277888999', 'school' => 'Mfantsiman', 'staff_id' => 'T004', 'national_id' => 'GHA-901-234'],
    ['name' => 'Kofi Boateng', 'email' => 'kofi@teacher.com', 'phone' => '0244000111', 'school' => 'Prempeh College', 'staff_id' => 'T005', 'national_id' => 'GHA-567-890'],
];

foreach ($teachers as $t) {
    $pdo->prepare('INSERT INTO users (google_id, name, email, role, status) VALUES (?, ?, ?, "teacher", "active") ON DUPLICATE KEY UPDATE name=VALUES(name)')
        ->execute(['google_' . bin2hex(random_bytes(5)), $t['name'], $t['email']]);
    $userId = (int)$pdo->lastInsertId();

    // If duplicate, fetch the ID
    if ($userId === 0) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$t['email']]);
        $userId = (int)$stmt->fetchColumn();
    }

    $pdo->prepare('INSERT INTO teacher_profiles (user_id, phone, school_name, staff_id, national_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE phone=VALUES(phone)')
        ->execute([$userId, $t['phone'], $t['school'], $t['staff_id'], $t['national_id']]);
}

// 3. Create Plans
$plans = [
    ['name' => 'Starter Plan', 'amount' => 500.00, 'cadence' => 'Monthly', 'description' => 'Basic investment for new teachers.', 'benefits' => json_encode(['interest' => '5%', 'duration' => '1 year'])],
    ['name' => 'Growth Plan', 'amount' => 2000.00, 'cadence' => 'Quarterly', 'description' => 'Accelerated growth for experienced educators.', 'benefits' => json_encode(['interest' => '8%', 'duration' => '2 years'])],
    ['name' => 'Elite Plan', 'amount' => 10000.00, 'cadence' => 'Annual', 'description' => 'Premium investment for long-term wealth.', 'benefits' => json_encode(['interest' => '12%', 'duration' => '5 years'])],
];

foreach ($plans as $p) {
    $pdo->prepare('INSERT INTO plans (name, amount, cadence, description, benefits) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount=VALUES(amount)')
        ->execute([$p['name'], $p['amount'], $p['cadence'], $p['description'], $p['benefits']]);
}

// 4. Create Dynamic Content (CMS)
$contents = [
    ['page' => 'home', 'key' => 'hero_title', 'val' => 'Invest in Your Future, Teacher.'],
    ['page' => 'home', 'key' => 'hero_subtitle', 'val' => 'The secure way for educators to build wealth.'],
    ['page' => 'home', 'key' => 'carousel', 'val' => json_encode([
        ['image' => 'assets/hero.png', 'title' => 'Secure Investments', 'desc' => 'Your money is safe with us.'],
        ['image' => 'assets/hero.png', 'title' => 'High Returns', 'desc' => 'Competitive interest rates.'],
    ])],
    ['page' => 'home', 'key' => 'workers', 'val' => json_encode([
        ['name' => 'Dr. Sarah Mensah', 'role' => 'Fund Manager', 'img' => 'assets/hero.png'],
        ['name' => 'Mr. Kofi Appiah', 'role' => 'Financial Advisor', 'img' => 'assets/hero.png'],
    ])],
    ['page' => 'home', 'key' => 'faq', 'val' => json_encode([
        ['q' => 'How do I join?', 'a' => 'Register via the admin portal.'],
        ['q' => 'When do I get paid?', 'a' => 'According to your plan cadence.'],
    ])],
];

foreach ($contents as $c) {
    $pdo->prepare('INSERT INTO content (page_key, content_key, content_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content_value=VALUES(content_value)')
        ->execute([$c['page'], $c['key'], $c['val']]);
}

echo "Seeding completed successfully!\n";
