# TiFund API

The API is a PHP/PDO service for Teacher Investment Fund. It uses a local SQLite database by default and initializes its tables, indexes, default plans, and default page content when the API starts.

## Start the API

1. Enable PHP `pdo_sqlite` and `curl`.
2. Run `composer install` in this folder.
3. Configure the Google OAuth and Paystack values used by the API in `api/.env` (the API never needs the Paystack secret in the frontend).
4. Start the API from this folder:

   ```powershell
   php -S 127.0.0.1:8000 -t .
   ```

5. Set `VITE_API_URL=http://127.0.0.1:8000` in `frontend/.env` and start the frontend.

The API allows the local Vite origins `http://localhost:5173` and `http://127.0.0.1:5173` by default. For another frontend origin, set `FRONTEND_URL` or a comma-separated `FRONTEND_URLS` list in `api/.env`.

The database file defaults to `api/database/tifund.sqlite`. Set `DB_PATH` in `api/.env` to use a different absolute or relative file path. The API creates the containing directory if needed and enables SQLite foreign keys and WAL mode. The generated database file is ignored by Git; keep backups outside the source tree.

`database/schema.sql` is the SQLite reference schema. `src/Database/Schema.php` is the executable source of truth and applies safe `CREATE TABLE IF NOT EXISTS` definitions plus missing-column additions at startup. Six editable sample contribution plans and default public content are seeded without replacing administrator edits. The sample plan amounts and terms are examples, not promised returns. Three supplemental service entries are added once to any existing service list.

> **Existing database data:** switching from MySQL to SQLite creates a new SQLite file; existing MySQL records are not automatically copied. Back up and migrate any records you need before retiring the MySQL database.

## API routes

### Public

- `POST /auth/google` verifies a Google credential and returns the existing or newly-created account with its associated `teacher_profile`.
- `GET /plans`
- `GET /content/home`
- `GET /content/services`
- `GET /content/contact`
- `POST /registration`
- `POST /contact` stores name, email, optional phone/subject, and message. If a valid bearer token is supplied, the submission is associated with that account; anonymous submissions remain available to administrators only.
- `POST /payments/webhook`

### Signed-in users

- `GET/POST/PUT/DELETE /account` reads or updates contact and teacher-profile details. Google-managed name/email remain read-only. Only admins can change staff IDs.
- `GET /account/messages` returns messages associated with the signed-in account. Existing messages are linked to matching account emails once during migration.
- `GET /history`, `GET /notifications`, `PUT /notifications/{id}/read`
- `POST /payments/verify`
- `GET /activity`

### Admin

- `GET /admin/summary`, `/admin/users`, `/admin/teachers`
- `GET/PUT/DELETE /admin/teachers/{id}` manages user profile details and account status; deletion remains restricted to teacher accounts.
- `GET /admin/teachers/{id}/documents/{document_id}` streams a teacher document to an administrator after verifying document ownership.
- `POST /admin/teachers/register`
- `GET/PUT /admin/content` manages homepage, services, and contact-page content.
- `GET /admin/messages` returns all messages with sender/account metadata for the grouped admin inbox; `PUT /admin/messages/{id}/status` marks a message `read` or `unread`; `POST /admin/notifications`
- `GET /admin/activities`, `GET /admin/payments`, and `/admin/plans`

User queries return account identity alongside the matching teacher profile. Google sign-in is idempotent: returning accounts and their profiles are reused rather than inserted again.

Profile photos and CMS images are served from their stored `uploads/` paths. Teacher documents use the authenticated admin endpoint above rather than a public file path. When an uploaded profile photo, teacher document, or CMS asset is replaced, the API checks the stored references before removing the old file from `api/uploads`. Shared files and files still referenced by another record are retained.

Prepared statements, signed session tokens, Google credential validation, admin-role checks, Paystack verification and webhook signature validation are used for the relevant API operations. Never commit `.env`, database files, private Paystack keys, or credentials.
