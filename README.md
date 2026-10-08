# 🏢 Office Asset Tracker

A minimal full-stack hardware and equipment tracking web application built for a 45-minute workshop. It features passwordless authentication via **WhatsApp & SMS OTP powered by the [Minimoth API](https://minimoth.dev)**, instant inventory management, and assignment tracking.

---

## ⚡ Features & Workshop Scope

* **Strictly Minimal & Focused:**
  * **3 Frontend Pages:**
    1. **Authentication:** User registration & login via Minimoth WhatsApp/SMS OTP.
    2. **Asset Inventory:** Equipment list with realtime search, category icons, and status filtering (`All`, `Available`, `Assigned`, `Maintenance`).
    3. **Add Asset:** Quick form to register new hardware into inventory.
  * **5 Functional Backend Endpoints:**
    1. `POST /api/auth/send-otp` - Sends OTP to mobile number using Minimoth API.
    2. `POST /api/auth/verify-otp` - Verifies OTP with Minimoth API and provisions session.
    3. `GET /api/assets` - Lists assets with optional status and search filtering.
    4. `POST /api/assets` - Registers new asset and records audit log.
    5. `PATCH /api/assets/:id/status` - Updates asset status, assignment, and logs changes.
  * **3 Database Entities / Models:**
    1. `User` (id, phone, name, role, createdAt)
    2. `Asset` (id, name, category, serialNumber, status, assignedTo, location, createdAt, updatedAt)
    3. `AssetLog` (id, assetId, action, details, performedBy, timestamp)
* **Design & Aesthetics:** Dark mode aesthetic with glassmorphism cards, responsive layout, status badges, and typography using Google Fonts (Plus Jakarta Sans).

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, Lucide Icons, Pure Vanilla CSS
* **Backend:** Node.js, Express, dotenv, cors
* **OTP Provider:** [Minimoth API](https://minimoth.dev)

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/SohamSB-web/Office-Asset-Tracker.git
cd Office-Asset-Tracker
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5001
MINIMOTH_API_KEY=mm_live_a3cfb431c9d76ef35002fc1b32f016c377a858c8fbcf1aeb2c844f909734e965968891a38d265140df06a406dc0195d3
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5001/api
```

*(Note: `.env.example` templates are also included in both folders)*

---

### 3. Install Dependencies & Run

#### Terminal 1: Backend
```bash
cd backend
npm install
npm start
```
> The API server will be live at `http://localhost:5001`.

#### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
> The client web app will be accessible at `http://localhost:5173`.

---

## 📡 Minimoth OTP Flow

1. Enter your phone number with country code (e.g., `+91 9876543210`).
2. Minimoth dispatches a 6-digit one-time passcode directly to your phone via WhatsApp (with SMS fallback).
3. Enter the 6-digit code to securely sign in or register automatically.

---

## 📂 Project Structure

```text
Office-Asset-Tracker/
├── backend/
│   ├── data/
│   │   └── database.json    # Lightweight JSON-backed database
│   ├── .env                 # Backend environment variables
│   ├── .env.example         # Template
│   ├── db.js                # 3 Entities: User, Asset, AssetLog
│   ├── package.json
│   └── server.js            # 5 Minimal API endpoints
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx   # Top navigation & user session badge
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx     # Page 1: Minimoth OTP Authentication
│   │   │   ├── AssetsPage.jsx   # Page 2: Inventory & Status Management
│   │   │   └── AddAssetPage.jsx # Page 3: New Asset Registration
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```

---

## 📄 License
MIT License
