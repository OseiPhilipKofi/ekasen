-- SQLite reference schema. The API applies equivalent idempotent definitions
-- and seeds default plans/content through TiFund\Database\Schema on startup.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
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
);

CREATE TABLE IF NOT EXISTS identity_documents (
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
);

CREATE TABLE IF NOT EXISTS activity_logs (
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
);

CREATE TABLE IF NOT EXISTS teacher_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'birth_certificate', 'teacher_certificate')),
  file_path TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  cadence TEXT NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
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
);

CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_key TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (page_key, content_key)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plans (name, amount, cadence, description, benefits)
SELECT 'Starter Saver', 100, 'Monthly', 'A simple beginning for consistent saving.', '["Flexible monthly deposits","Contribution history in your account","Member support"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Starter Saver');

INSERT INTO plans (name, amount, cadence, description, benefits)
SELECT 'Growth Builder', 300, 'Monthly', 'A regular contribution option for members building a savings habit.', '["Monthly contributions","Contribution history in your account","Member support"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Growth Builder');

INSERT INTO plans (name, amount, cadence, description, benefits)
SELECT 'Executive Future', 600, 'Monthly', 'A higher monthly contribution option for long-term planning.', '["Monthly contributions","Contribution history in your account","Member support"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Executive Future');

INSERT INTO plans (name, amount, cadence, description, benefits)
SELECT 'Steady Saver', 150, 'Monthly', 'A manageable monthly contribution option for steady saving.', '["Monthly contributions","Contribution history in your account","Member support"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Steady Saver');

INSERT INTO plans (name, amount, cadence, description, benefits)
SELECT 'Quarterly Builder', 900, 'Quarterly', 'A quarterly contribution option for members who prefer less frequent payments.', '["Quarterly contributions","Contribution history in your account","Member support"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Quarterly Builder');

INSERT INTO plans (name, amount, cadence, description, benefits)
SELECT 'Future Focus', 1200, 'Annual', 'An annual contribution option for members planning ahead.', '["Annual contributions","Contribution history in your account","Member support"]'
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Future Focus');
