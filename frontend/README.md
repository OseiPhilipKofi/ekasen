# TiFund frontend

This is the React/Vite side of TeacherInvestmentFund. It contains the public site, Google sign-in, teacher dashboard and history, Paystack-only plan payments, and the admin link that is shown only to an admin session.

## Start it

```bash
npm install
copy .env.example .env
npm run dev
```

The development server is fixed to `http://localhost:5173`. Open that URL after `npm run dev`; do not open the PHP `api` folder or an unused Vite port directly.

Set `VITE_API_URL` to the URL where the root-level `api` folder is served. Add the Google OAuth client id and Paystack public test key to `.env`; do not place private keys in this file.

## Main routes

- `/` landing page and feature search
- `/about` institution story and FAQs
- `/contact` contact form
- `/plans` Ghana cedi subscription plans and Paystack popup
- `/login` Google-only login
- `/dashboard` signed-in teacher overview
- `/history` signed-in payment history
- `/payments` Paystack payment guidance and contribution entry
- `/account` teacher profile and verification status
- `/notifications` account notifications
- `/admin` admin-only teacher management view

All HTTP calls go through `src/lib/api.js` using Axios. Reusable shell/navigation lives in `src/components`. Keep API paths relative to the API base URL so hosting does not require frontend rewrites.
