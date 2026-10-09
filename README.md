# TiFund - Teacher Investment Fund

TiFund is a teacher-focused savings and investment management project for Ghana. It provides Google sign-in, teacher profiles, contribution records, dynamic public content, and protected administration tools.

## Local development

### API (PHP and SQLite)

Enable `pdo_sqlite` and `curl`, install Composer dependencies from `api/`, and start the API:

```powershell
cd api
composer install
php -S 127.0.0.1:8000 -t .
```

The API creates `api/database/tifund.sqlite` and initializes the schema and default content automatically. Set `DB_PATH` in `api/.env` to select another SQLite file. Configure Google and Paystack server credentials in the API environment.

### Frontend (React and Vite)

```powershell
cd frontend
npm install
npm run dev
```

Configure `VITE_API_URL=http://127.0.0.1:8000`, the Google OAuth client ID, and the Paystack **public** key in `frontend/.env`. Do not put server secrets in frontend environment variables.

## Core behavior

- `/dashboard` renders a single role-specific dashboard; the welcome heading uses the signed-in user's first name.
- Users and admins can edit non-Google profile details. Google-provided name/email stay read-only; staff IDs are editable only by admins, including for the admin's own profile.
- Google sign-in reuses existing accounts and returns each account with its associated teacher profile.
- Public services and contact information are managed from **Admin → Content**. Contact supports configured WhatsApp, phone, and email actions plus a custom message form.
- The frontend theme is centrally configurable through global CSS custom properties in `frontend/src/style.css`.

See [api/README.md](api/README.md) and [frontend/README.md](frontend/README.md) for setup and route details. Switching from MySQL to SQLite creates a new SQLite file; it does not automatically import records from the previous database.
