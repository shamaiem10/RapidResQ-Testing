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

Monorepo at this folder’s root (`RapisResQ-Final` if nested in your repo). **Vercel:** set the project **Root Directory** to this folder (the one containing `vercel.json`).

```
.
├── api/
│   └── index.js       # Thin Vercel entry only (re-exports backend; avoids extra /api/*.js functions)
├── backend/           # Express API (routes, models, serverless app + local server.js)
├── web/               # React app (CRA → web/build)
├── vercel.json        # Single project: static web + Node function
├── env.example        # Copy to backend/.env locally
├── package.json       # npm run install:all, dev:api, dev:web
└── README.md
```

### Deploy on Vercel

1. In Vercel **New Project**, import this repo and set **Root Directory** to the folder that contains `vercel.json` (if your repo wraps the app, e.g. `RapisResQ-Final`, choose that).
2. **Environment variables** (Production + Preview as needed): `MONGO_URI`, `JWT_SECRET`, and optional `EMAIL_USER`, `EMAIL_PASSWORD`, `GROQ_API_KEY`. Add `NODE_ENV=production` if you rely on it.
3. **Function duration:** Default is often 10s on Hobby. Open **Project → Settings → Functions** and raise **Max Duration** for the Node handler if MongoDB/Groq cold starts time out (up to your plan limit).
4. Frontend calls **`/api` on the same origin** in production (see `web/src/utils/config.js`). Set **`REACT_APP_API_URL`** only if the UI and API use different origins.
5. Atlas: allow **`0.0.0.0/0`** (or Vercel’s egress IPs) in **Network Access** so the serverless API can reach MongoDB.

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
# If this app lives in a subfolder (e.g. RapisResQ-Final), cd into it before installing.
```

### 2️⃣ Install Dependencies

From the folder that contains `web/`, `backend/`, `vercel.json`, and `api/index.js`:

```bash
npm install --prefix backend && npm install --prefix web
```

(or `npm run install:all` from the root `package.json`.)

### 3️⃣ Setup Environment Variables

Create `backend/.env` (copy from `env.example`):

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

**Start Backend Server**

```bash
cd backend
npm run dev
# or
npm start
```

Backend will run on:
```
http://localhost:5000
```

**Start Frontend Server**

```bash
cd ../web
npm start
```

Frontend will run on:
```
http://localhost:3000
```

## Authentication & Security

- Passwords are hashed using bcrypt
- JWT-based authentication
- Input validation & sanitization
- CORS protection
- Environment variables for sensitive data

## API Overview

**Base URL:**
```
http://localhost:5000/api
```

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
