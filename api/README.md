# TiFund API

This is the root-level PHP API for TeacherInvestmentFund. `index.php` is a thin entry point; application code is organized under `src/` into configuration, database/schema bootstrap, HTTP primitives, repositories, controllers, and a router.

## Start it

1. Enable PHP PDO MySQL and the PHP zip extension in XAMPP.
2. Run `composer install` in this folder.
3. Copy `.env.example` to `.env` and fill in the local MySQL, Google, API, and Paystack values.
4. Serve the project from Apache as `http://localhost/EKASEN`, or point `VITE_API_URL` at the API URL.

`src/Database/Connection.php` validates the configured database name, creates it if missing, and opens a PDO connection. `src/Database/Schema.php` runs `CREATE TABLE IF NOT EXISTS` for every required table on every API connection, so a missing table is recreated before requests continue. `database/schema.sql` is the human-readable reference schema. The API also seeds the three starter plans when the plans table is empty. Never commit `.env`, private Paystack keys, database passwords, or API secrets.

## Request routes

- `POST /auth/google` accepts `{ "credential": "google-id-token" }` and creates/updates the user.
- `GET /plans` returns active plans.
- `GET /content/home` returns editable home content.
- `POST /contact` saves a contact message.
- `GET /history` returns the signed-in member's payment history.
- `POST /payments/verify` verifies and saves a successful Paystack popup response.
- `POST /payments/webhook` validates `X-Paystack-Signature` and updates successful charges.
- `GET /admin/teachers` returns teacher records for an admin session.
- `POST /admin/teachers/register` or `/admin/registration` registers a teacher with multipart profile/document uploads.
- `GET /admin/teachers/{id}` returns one teacher and protected document metadata.
- `PUT/DELETE /admin/teachers/{id}` updates or removes a teacher account.
- `PUT /admin/content`, `GET /admin/messages`, and `POST /admin/notifications` support admin content and communication workflows.
- `GET /admin/activities`, `GET /admin/payments`, and `/admin/plans` support audit, cashflow, and plan administration.
- `GET/PUT/POST/DELETE /account` supports the signed-in user's profile CRUD and profile-photo upload.
- `GET /activity` and `/activities` return the signed-in user's activity history.

Send the session token from the Google response as `Authorization: Bearer <token>`. The Paystack browser popup is the only payment initiation method; the API calls Paystack's server-side verification endpoint before persisting a response and validates signed webhook callbacks.

Identity evidence belongs in `identity_documents` as validated MySQL binary data and should only be exposed through an authenticated admin download endpoint when that workflow is enabled.

All domain tables use an auto-incrementing `id` primary key. User-owned queries use the authenticated account identity; email is retained as a unique contact/login identifier and returned in account/payment/admin views. Development-safe seed plans and content sections are inserted only when those tables are empty.

Security checks include prepared SQL statements, strict database-name validation, Google tokeninfo verification with issuer/expiry/audience checks, HMAC session tokens, admin-role guards, Paystack signature verification, Paystack server-side transaction verification, CORS allowlisting, and response hardening headers.
