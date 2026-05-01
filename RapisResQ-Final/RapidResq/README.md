# 🚨 RapidResq – Emergency Response Web Platform

RapidResq is a MERN-stack emergency response platform designed to help people during critical situations through real-time alerts, AI assistance, community coordination, and safety mapping.

It provides a panic button system, AI emergency chatbot, community help board, first aid guidance, and nearby emergency service mapping.

## Key Features

-  **Panic Button** – One-tap emergency alert posted to the community
-  **AI Emergency Assistant** – Real-time guidance using AI
-  **Safety Map** – Nearby hospitals, police stations, and emergency services
-  **Community Board** – Post and respond to emergencies in real time
-  **First Aid Library** – Step-by-step emergency medical instructions
-  **Emergency Numbers** – Quick access to verified contacts
-  **Email Alerts** – Automatic notifications to volunteers

## Tech Stack

### Frontend
- React (v19)
- React Router
- Axios
- Leaflet.js (Maps)
- CSS (Responsive Design)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (Email alerts)

### AI & Services
- Groq AI SDK (LLaMA model)
- RESTful API architecture

## 📁 Project Structure

```
RapidResq/
├── vercel.json              # Single Vercel project: CRA static + Node serverless
├── package.json             # Root scripts (install / dev)
├── env.example              # Environment variable template
├── api/                     # Express API (serverless on Vercel)
│   ├── index.js             # Vercel entry (serverless-http)
│   ├── server.js            # Local dev server only
│   ├── config/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── utils/
└── web/                     # Create React App (production static build)
    ├── public/
    └── src/
```

## Prerequisites

Make sure you have installed:
- Node.js (v16 or higher)
- npm
- MongoDB (local or Atlas)
- Git

## How to Run the Project Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/shamaiem10/RapidResq.git
cd RapidResq
```

### 2️⃣ Install Dependencies

From the repository root (installs both apps):

```bash
npm run install:all
```

Or separately:

```bash
cd api && npm install
cd ../web && npm install
```

### 3️⃣ Setup Environment Variables

Copy `env.example` to `api/.env` and fill in values (see template).  
Create `api/.env` with:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret

# Optional (for full features)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
GROQ_API_KEY=your_groq_api_key
```

### 4️⃣ Run the Application

**Start API (from repo root)**

```bash
npm run dev:api
```

Or:

```bash
cd api
npm run dev
```

API listens on `http://localhost:5000` (see `PORT` in `api/.env`).

**Start web app (React)**

```bash
npm run dev:web
```

Or:

```bash
cd web
npm start
```

App: `http://localhost:3000` (uses `http://localhost:5000/api` in development).

## Deploy on Vercel (single project)

1. Push this repo to GitHub (or GitLab / Bitbucket) and import it in [Vercel](https://vercel.com).
2. Leave the Vercel **Root Directory** empty (repository root), so `vercel.json` applies. Only set a subdirectory if you split frontend and API into separate projects.
3. Vercel runs `installCommand`, then builds `web/` with `@vercel/static-build` and routes `/api/*` to `api/index.js`.
4. Add **Environment Variables** in the project: `MONGO_URI`, `JWT_SECRET`, and optionally `EMAIL_USER`, `EMAIL_PASSWORD`, `GROQ_API_KEY`.
5. Production traffic uses same-origin **`/api`**. Set `REACT_APP_API_URL` only if the API is hosted on another domain.

After deploy, open your `*.vercel.app` URL; static pages load from the CRA build and API requests go to `/api/...`.

## Authentication & Security

- Passwords are hashed using bcrypt
- JWT-based authentication
- Input validation & sanitization
- CORS protection
- Environment variables for sensitive data

## API Overview

**Base URL (local):** `http://localhost:5000/api`  
**Base URL (Vercel, single deploy):** `/api` (same origin; production builds use this automatically)

**Main API Modules:**
- `/login` – User authentication
- `/register` – User registration
- `/panic` – Panic button alert
- `/community` – Community posts
- `/chat` – AI emergency assistant
- `/emergency/services` – Nearby services

## Testing & Performance

- Unit & integration testing
- Emergency flow testing (panic button, alerts)
- Designed to support 100+ concurrent users
- Optimized API response times

## Team Skyra

- **Kiran Waqar** – Backend Developer & Project Lead
- **Maryam Sheraz** – Backend Developer
- **Shamaiem Shabbir** – Frontend Developer + Backend(SafetyMaps)

## License

This project is developed for academic and educational purposes. Feel free to fork and improve.

---
