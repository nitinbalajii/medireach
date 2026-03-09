# MediReach

A web and mobile platform for finding emergency health resources in Delhi. Built as a final year project.

Live site: https://medireach-tawny.vercel.app  
Backend API: https://medireach-idb2.onrender.com/api

---

## What it does

Finding an available hospital during an emergency in a city like Delhi is harder than it should be. MediReach tries to fix that by putting hospital bed availability, ambulance dispatch, blood donors, pharmacies, and doctors all in one place.

Key features:
- Real-time hospital bed availability with filters (ICU, oxygen, emergency ward)
- One-tap SOS that automatically finds the nearest ambulance and hospital
- Live ambulance tracking via WebSocket
- Blood donor search by blood group and area
- Medicine search across pharmacies with stock and pricing
- Doctor directory with schedule and teleconsult info
- Patient QR profile that hospitals can scan
- JWT authentication with role-based access

---

## Tech stack

**Frontend** — Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, MapLibre GL, Socket.io client  
**Backend** — Node.js, Express 5, MongoDB Atlas, Mongoose, Socket.io, JWT  
**Mobile** — React Native (Expo), NativeWind, expo-location, expo-camera, expo-secure-store  
**Deployment** — Vercel (frontend), Render + UptimeRobot (backend), MongoDB Atlas (database)

---

## Running locally

**Backend**
```bash
cd backend
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev            # starts on port 5000
```

**Frontend**
```bash
npm install
# set NEXT_PUBLIC_API_URL=http://localhost:5000/api in .env.local
npm run dev            # starts on port 3000
```

**Mobile**
```bash
cd mobile
npm install
npx expo start
```

---

## Project structure

```
medireach/
├── app/              # Next.js pages (15 routes)
├── components/       # Shared React components
├── lib/              # API client, socket wrapper, types, utilities
├── backend/          # Express server, controllers, models, routes
└── mobile/           # React Native app (Expo)
```

---

## Database

MongoDB Atlas with 9 collections: hospitals, ambulances, emergencyrequests, doctors, patients, pharmacies, donors, crowdreports, users.

Geospatial queries use MongoDB's `$near` operator with `2dsphere` indexes on hospital, ambulance, and pharmacy locations.

To seed the database with Delhi test data:
```bash
cd backend
node seed.js
```

---

Built by Nitin Balaji — final year B.Tech project, 2025-26.
