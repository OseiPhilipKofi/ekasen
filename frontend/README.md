# TiFund frontend

This is the React/Vite side of Teacher Investment Fund. It contains the public site, Google sign-in, role-aware account dashboard, payment history, Paystack plan payments, contact options, and admin tools.

## Start it

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173`. Open that URL after `npm run dev`.

Create `frontend/.env` with `VITE_API_URL` set to the PHP API URL (for example `http://127.0.0.1:8000`), and set the Google OAuth client ID and Paystack **public** key there. Never put private keys in the frontend.

## Main routes

- `/` landing page and feature search
- `/about` institution story and FAQs
- `/services` administrator-managed service listings
- `/contact` WhatsApp, call, email, and custom message form
- `/plans` Ghana cedi subscription plans and Paystack popup
- `/login` Google-only login
- `/dashboard` the single role-aware dashboard route; teachers see their account overview and admins see the management overview
- `/history` signed-in payment history
- `/payments` Paystack payment guidance and contribution entry
- `/account` shared user/admin profile editing and verification status; Google-managed name/email are read-only and only admins can edit staff IDs
- `/notifications` account notifications
- `/admin/*` admin-only management sections

The member dashboard includes a Messages section that displays only submissions associated with the signed-in account. The administration dashboard has a separate Messages section that groups submissions by registered sender (or email for unlinked submissions) and lets administrators expand each sender to read individual messages and mark them read or unread. Signed-in contact submissions are associated with the current account; anonymous submissions remain in the admin inbox.

Admins manage service listings, homepage carousel slides, worker profiles, sponsor/partner cards, FAQs, and contact phone/WhatsApp/email settings from **Admin → Content**. Homepage benefit, worker, and configured sponsor cards use pausable auto-sliders; sponsor cards remain hidden until the admin adds confirmed entries. Direct-contact settings are intentionally configurable rather than hard-coded.

All HTTP calls go through `src/lib/api.js` using Axios. Reusable shell/navigation lives in `src/components`. Global theme colors and surface tokens are declared in `src/style.css` under `:root` (`--brand-primary`, `--brand-primary-dark`, `--brand-green`, `--brand-gold`, `--brand-ink`, `--brand-muted`, `--brand-line`, `--brand-surface`, `--brand-canvas`, `--brand-card-tint`, `--brand-card-cool`, and `--brand-card-warm`). Update those values to restyle buttons, cards, carousel panels, and page backgrounds consistently.

Uploaded profile and CMS image paths are resolved against the configured API host through `ProfileAvatar`. Admin document thumbnails are fetched through the authenticated admin API, rather than exposed as public upload URLs.
