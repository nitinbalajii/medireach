# 🏥 MediReach - Unified City Health Resource Finder

A city-level web platform connecting citizens, hospitals, ambulances, and blood donors for real-time healthcare access during emergencies in Delhi.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?style=flat-square&logo=tailwind-css)

## 🌟 Features

- 🏥 **Hospital Finder** - Locate nearby hospitals with real-time bed availability
- 🚑 **Ambulance Service** - Request ambulances with GPS tracking
- 🩸 **Blood Donor Network** - Connect with verified donors by blood type and location
- 📍 **Interactive Maps** - MapLibre GL integration for location visualization
- 🔔 **Emergency Alerts** - Real-time health alerts and notifications
- 👨‍⚕️ **Admin Panel** - Manage hospitals, donors, and emergency data
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🌙 **Dark Mode** - Eye-friendly interface

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or later
- **pnpm** (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd medireach
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp env.example .env.local
   
   # Edit .env.local and add your API keys (optional for now)
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
medireach/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── find-hospital/     # Hospital finder
│   ├── donors/            # Blood donor search
│   ├── request-ambulance/ # Ambulance request
│   ├── dashboard/         # Emergency dashboard
│   ├── admin/             # Admin panel
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── hospital-map.tsx  # Map components
│   └── ...
├── lib/                   # Utilities and data
│   ├── delhi-data.ts     # Mock data for Delhi
│   └── utils.ts          # Helper functions
├── styles/               # Global styles
├── public/               # Static assets
└── ...
```

## 🛠️ Tech Stack

### Frontend (Current)
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui + Radix UI
- **Maps**: MapLibre GL
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

### Backend (Planned)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT or Firebase Auth
- **SMS**: Twilio
- **Real-time**: Socket.io

## 📋 Available Scripts

```bash
# Development
pnpm dev          # Start dev server (localhost:3000)

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

## 🗺️ Current Status

### ✅ Completed
- Frontend UI/UX for all pages
- Mock data for Delhi hospitals, donors, and ambulances
- Interactive map integration
- Responsive design
- Search and filter functionality
- Component library setup

### 🚧 In Progress
- Backend API development
- Database integration
- Authentication system

### 📅 Planned
- Real-time bed availability updates
- SMS notifications via Twilio
- Google Maps API integration
- Hospital staff portal
- Mobile app (React Native)

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional - currently using MapLibre (no API key needed)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key

# Backend (when implemented)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
MONGODB_URI=mongodb://localhost:27017/medireach
JWT_SECRET=your_secret_key
```

See `env.example` for all available options.

## 🌐 Deployment

### Frontend Only (Current)
Deploy to Vercel (recommended for Next.js):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or push to GitHub and connect to Vercel/Netlify.

### Full Stack (Future)
- **Frontend**: Vercel/Netlify
- **Backend**: Render/Railway/Heroku
- **Database**: MongoDB Atlas

## 📊 Mock Data

Currently using static data for Delhi:
- 6 hospitals (AIIMS, Safdarjung, Max Saket, etc.)
- 6 blood donors (various blood types)
- 3 ambulances (different locations)
- Emergency alerts

Located in: `lib/delhi-data.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Built for emergency healthcare access in Delhi.

## 📞 Support

For support, email [your-email] or open an issue.

## 🙏 Acknowledgments

- Delhi hospitals for inspiration
- shadcn/ui for component library
- MapLibre for open-source mapping
- Next.js team for the amazing framework

---

**Note**: This is currently a frontend prototype with mock data. Backend integration is in development.
