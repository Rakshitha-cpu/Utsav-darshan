# Utsav Darshan — Discover the Culture Around You

A full-stack, community-driven cultural festival and calendar discovery platform built for Indian temple festivals, jatras, melas, traditional music/dance, and regional celebrations.

---

## 🏛️ Key Features

1. **City-Based Discovery & Search**: Filter by cities (Bengaluru, Mysuru, Mangaluru, Chennai, Kolkata, Jaipur, Mumbai, Kochi) or search keywords and categories.
2. **Interactive Cultural Calendar**: Monthly view with multi-day festival spans, date selection drawer, and category filtering.
3. **Interactive Venue Maps**: OpenStreetMap integration via Leaflet for geolocation, venue pinpointing, and direction links.
4. **Community Submissions with Verification Queue**:
   - Community submissions enter a **Pending Review** queue.
   - Built-in duplicate detection warns submitters of overlapping celebrations.
   - Evidence URLs and documentation requirements.
5. **Admin Moderation Center**:
   - Approve, reject, or request corrections with submitter feedback notes.
   - Direct edit and archive capabilities.
   - Inaccuracy report resolution (cancellations, rescheduled dates).
6. **Live Analytics & Charts**: Recharts visualization for festival distributions across cities and categories.
7. **Role-Based Authentication**: Public visitors, Contributors, and Administrators secured with JWT and bcrypt password hashing.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Leaflet, Recharts, Date-fns.
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT, Helmet, CORS, Bcryptjs.
- **Zero-Config Database**: Seamlessly connects to MongoDB Atlas or automatically falls back to an embedded in-memory MongoDB engine for instant local evaluation without needing MongoDB installed locally!

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+) and npm installed.

### 2. Backend Setup
```bash
cd server
npm install
npm run seed     # (Optional: seeds 30+ authentic Indian festivals & demo users)
npm start        # Starts Express API at http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev      # Launches Vite dev server at http://localhost:5173
```

Now open `http://localhost:5173` in your browser!

---

## 👤 Sample Demonstration Accounts

Use these pre-seeded test accounts to explore the platform:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@utsavdarshan.in` | `password123` | Full moderation queue, approvals, rejection reasons, analytics, reports |
| **Contributor** | `contributor@utsavdarshan.in` | `password123` | Event submissions, tracking submission review status |
| **Standard User** | `user@utsavdarshan.in` | `password123` | Bookmarking / saving events, profile view |

---

## 📂 Project Structure

```
utsav-darshan/
├── server/
│   ├── src/
│   │   ├── config/       # MongoDB connection & in-memory fallback
│   │   ├── middleware/   # JWT protection & role authorization
│   │   ├── models/       # User, Event, City, Category, EventReport, ModerationLog
│   │   ├── routes/       # Auth, Events, Admin, Metadata, Users
│   │   ├── scripts/      # Database seeding scripts
│   │   ├── tests/        # Automated unit tests
│   │   └── index.js      # Express server entry point
│   ├── .env.example
│   └── package.json
└── client/
    ├── src/
    │   ├── components/   # Navbar, Footer, EventCard, MapComponent
    │   ├── context/      # AuthContext
    │   ├── pages/        # Home, Explore, Calendar, EventDetails, Submit, City, Admin, Profile, Auth
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🧪 Testing

Run backend tests:
```bash
cd server
npm test
```
Build frontend production bundle:
```bash
cd client
npm run build
```
