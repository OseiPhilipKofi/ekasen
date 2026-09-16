# TiFund - Teacher Investment Fund Management System

TiFund is a specialized investment fund management system designed for teachers in Ghana. It allows for secure teacher onboarding, contribution tracking, and dynamic content management.

## 🚀 Local Startup

TiFund runs as two local services: a Vite-powered React frontend and a custom PHP MVC API.

### 1. Start the Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173/** in the browser.

### 2. Start the API
With XAMPP/Apache, serve the project as `http://localhost/EKASEN/api` and set `frontend/.env`:
```env
VITE_API_URL=http://localhost/EKASEN/api
```
Alternatively, run from the `api` folder:
```powershell
php -S localhost:8000 -t .
```
Then set `VITE_API_URL=http://localhost:8000`.

---

## 🛠️ Technical Architecture

### Frontend
- **React 19 & Vite**: Modern UI with fast HMR.
- **Tailwind CSS**: Utility-first styling for a clean, professional look.
- **Framer Motion**: Smooth animations for carousel and FAQ sections.
- **Lucide-React**: Consistent iconography throughout the application.

### Backend
- **PHP (Custom MVC)**: Lightweight, high-performance API.
- **MySQL**: Relational database for users, profiles, payments, and CMS content.
- **PDO**: Secure database interactions with prepared statements.
- **Google OAuth 2.0**: Secure identity verification for teachers.
- **Paystack API**: Integration for seamless contribution payments.

## 📂 Key Features

### Admin Dashboard
- **Teacher Onboarding**: Multipart form for registering teachers with professional details and identity document uploads.
- **User Management**: Full CRUD for user accounts, role management, and account status control.
- **CMS Studio**: Dynamic management of homepage Hero text, Carousel slides, Team/Worker cards, and FAQs.
- **Payment Tracking**: Comprehensive view of all fund contributions across the system.
- **Notifications**: Targeted notifications sent directly to specific teacher accounts.

### User Experience
- **Secure Account**: Google-based authentication with restricted profile updates (contact info and photos only).
- **Investment Dashboard**: Real-time tracking of contributions and payment history.
- **Plan Catalog**: Transparent view of available investment plans.

## 📡 API Endpoints

### Public
- `GET /content/home`: Fetch all dynamic homepage content.
- `POST /registration`: Public teacher registration request.
- `POST /contact`: Submit contact messages.

### Authenticated (Teacher)
- `GET /account`: Retrieve profile and professional details.
- `PUT /account`: Update contact phone and profile photo.
- `GET /history`: Retrieve personal payment history.
- `GET /notifications`: Fetch account notifications.

### Admin Only
- `GET /admin/users`: List all user accounts.
- `POST /admin/teachers/register`: Admin-led teacher onboarding.
- `GET/PUT/DELETE /admin/teachers/{id}`: Manage specific teacher profiles.
- `GET/PUT /admin/content`: Manage site-wide CMS content.
- `POST /admin/upload-cms`: Secure upload of CMS assets (images).
- `POST /admin/notifications`: Send targeted notices.
- `GET /admin/payments`: Track all system payments.
