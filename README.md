# 🏥 MediReach — Unified City Health Resource Finder

> A full-stack emergency health platform connecting Delhi citizens with hospitals, ambulances, blood donors, and pharmacies in real time.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-medireach--tawny.vercel.app-blue?style=for-the-badge&logo=vercel)](https://medireach-tawny.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render)](https://medireach-idb2.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-nitinbalajii%2Fmedireach-181717?style=for-the-badge&logo=github)](https://github.com/nitinbalajii/medireach)

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🆘 **SOS Emergency** | One-tap dispatch — auto-assigns nearest ambulance & hospital |
| 🏥 **Hospital Finder** | Real-time bed availability with MapLibre interactive maps |
| 🚑 **Ambulance Tracking** | Live GPS tracking via Socket.io WebSockets |
| 🩸 **Blood Donor Network** | 10+ verified Delhi donors, filter by blood type & area |
| 💊 **Medicine Finder** | Search 5 Delhi pharmacies with live inventory & pricing |
| 👨‍⚕️ **Doctor Directory** | Find doctors by specialty, area, teleconsult availability |
| 🔐 **JWT Auth** | Secure register/login with token-based sessions |
| 📋 **Patient QR Profile** | Generate scannable QR codes with medical history |
| 📊 **Admin Dashboard** | Manage hospitals, ambulances, and emergency data |

---

## 🚀 Live Deployment

| Service | URL |
|---|---|
| **Frontend** | https://medireach-tawny.vercel.app |
| **Backend API** | https://medireach-idb2.onrender.com/api |
| **Health Check** | https://medireach-idb2.onrender.com/api/health |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui + Radix UI
- **Maps:** MapLibre GL JS (OpenFreeMap tiles — no API key needed)
- **Real-time:** Socket.io Client
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB Atlas (cloud)
- **ODM:** Mongoose
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Real-time:** Socket.io WebSockets
- **Hosting:** Render (free tier + UptimeRobot keepalive)

---

## 📁 Project Structure

```
medireach/
├── app/                        # Next.js App Router pages
│   ├── page.tsx               # Home / landing page
│   ├── find-hospital/         # Hospital search + map
│   ├── donors/                # Blood donor network + map
│   ├── find-medicine/         # Medicine inventory search
│   ├── find-doctor/           # Doctor directory
│   ├── request-ambulance/     # SOS + ambulance dispatch
│   ├── track-ambulance/[id]/  # Live ambulance tracking
│   ├── profile/               # Patient QR health profile
│   ├── login/ & signup/       # JWT authentication
│   └── admin/                 # Admin dashboard
├── backend/
│   ├── controllers/           # Business logic
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── scripts/               # DB seed scripts
│   └── server.js              # Express + Socket.io setup
├── components/                # Reusable React components
│   ├── ui/                    # shadcn/ui primitives
│   ├── donor-map.tsx          # MapLibre donor map
│   ├── hospital-map-maplibre.tsx
│   ├── ambulance-map.tsx
│   └── emergency-button.tsx
└── lib/api/client.ts          # Typed API client
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)

### 1. Clone & install

```bash
git clone https://github.com/nitinbalajii/medireach.git
cd medireach
npm install
```

### 2. Frontend env

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Backend env

```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI and JWT_SECRET
```

### 4. Run both servers

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
npm run dev
```

Open http://localhost:3000

### 5. Seed the database (optional)

```bash
cd backend
node scripts/seedDonorsPharmacies.js   # 10 donors + 5 pharmacies
node seed.js                           # hospitals, ambulances, doctors
```

---

## 🔑 Environment Variables

### Frontend (`.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (include `/api`) |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `FRONTEND_URL` | Vercel URL for CORS allowlist |
| `NODE_ENV` | `development` or `production` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

*Built for real-time emergency healthcare access across Delhi.*
