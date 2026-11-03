# DETAILED PROJECT REPORT (DPR)

## Project Title: **Utsav Darshan – City Festival & Cultural Calendar Platform**
**Domain:** Full-Stack Web Development / Cultural Informatics / Tourism Tech  
**Program:** Unified Mentor Internship Capstone Project  
**Author / Developer:** Rakshitha  
**Repository:** [https://github.com/Rakshitha-cpu/Utsav-darshan](https://github.com/Rakshitha-cpu/Utsav-darshan)  
**Date:** November 2026  

---

## 1. Executive Summary

India possesses an unparalleled cultural heritage characterized by hundreds of living traditions, temple jatras, classical arts, melas, and seasonal harvest rituals. However, cultural discovery across Indian cities remains largely fragmented. Major event discovery portals focus almost entirely on commercial concerts, stand-up comedy, and nightlife, while sacred rituals, heritage processions, and village celebrations remain buried in regional newspapers or word-of-mouth.

**Utsav Darshan** is a production-grade, community-driven cultural festival and calendar discovery platform. It connects citizens, travelers, and cultural enthusiasts with authentic, verified Indian festivals across 19 major cultural hubs. Inspired by the **Ministry of Tourism's Incredible India** initiative, the platform incorporates multi-lingual accessibility (Kannada and English), interactive OpenStreetMap geospatial mapping, a multi-day cultural calendar, a crowd-sourced contributor verification pipeline, role-based admin moderation, and real-time cultural analytics.

---

## 2. Problem Statement & Objectives

### 2.1 The Problem
1. **Information Fragmentation:** Critical details (muhurtham timings, route maps, dress codes, historical context) of centuries-old festivals (e.g., *Bengaluru Karaga*, *Mysuru Dasara*, *Mangaluru Kambala*, *Kolkata Durga Puja*) are scattered and unverified.
2. **Commercial Bias:** Commercial ticketing platforms prioritize revenue-generating entertainment over living cultural heritage.
3. **Misinformation & Counterfeit Listings:** Dates of lunar-based festivals shift every year according to the Hindu Panchanga, leading to outdated listings and traveler confusion.
4. **Linguistic Barriers:** Local events are predominantly documented in regional languages or lost in translation for non-native visitors.

### 2.2 Core Objectives
- Build a centralized, verified digital repository for authentic Indian festivals.
- Provide an interactive, responsive calendar supporting single-day and multi-day spans.
- Implement geospatial mapping with interactive coordinates, venue details, and transit directions.
- Establish a rigorous crowd-sourced submission pipeline with duplication detection and an Admin Moderation Center.
- Deliver dual-language support (English and Kannada) to ensure regional inclusivity.
- Align design and civic references with Government of India tourism benchmarks (Incredible India helpline 1363).

---

## 3. Technology Stack & Architecture

### 3.1 Architecture Overview
The platform follows a modern, decoupled **Client-Server Architecture**:
- **Presentation Layer (Frontend):** Single Page Application (SPA) built using React 18, Vite, and Tailwind CSS.
- **Application & API Layer (Backend):** RESTful Web Services developed with Node.js and Express.js.
- **Data Persistence Layer:** Flexible document store with schema validation, indexes, and automated fallback persistence.
- **Geospatial & Visualization Layer:** Leaflet with OpenStreetMap tiles and Recharts for administrative telemetry.

### 3.2 Technology Matrix
| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS | Fast, reactive, mobile-first cultural UI |
| **Icons & Design** | Lucide React | Clean, accessible iconography |
| **Routing** | React Router DOM v6 | Client-side declarative routing and deep-linking |
| **Internationalization** | Custom Context Engine | Instant English ⇄ Kannada language toggling |
| **Geospatial Maps** | Leaflet, React-Leaflet | OpenStreetMap pinpoints and venue routing |
| **Data Analytics** | Recharts | Distribution charts for admin moderation |
| **Backend API** | Node.js, Express.js (ES Modules) | High-concurrency REST endpoints |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, Helmet, CORS | Role-Based Access Control (Admin, Contributor, User) |
| **Database** | Embedded NeDB / MongoDB compatible engine | High-speed, zero-config JSON document storage |
| **Deployment** | Vercel (Frontend) + Render (Backend) | Globally distributed, cloud-hosted infrastructure |

---

## 4. Key Functional Modules

### 4.1 City-Centric & Category Discovery
- **Multi-City Exploration:** Tailored portals for 19 key cultural hubs including Bengaluru, Mysuru, Mangaluru, Chennai, Madurai, Kolkata, Varanasi, Jaipur, Mumbai, and Kochi.
- **Thematic Categories:** 
  1. *Temple & Spiritual* (Rathotsavas, Sacred Jatras, Sanctum Pujas)
  2. *Cultural Festivals* (Dasara, Durga Puja, Onam, Hornbill)
  3. *Traditional Music & Dance* (Margazhi Season, Yakshagana, Kathakali)
  4. *Folk & Jatras* (Kambala, Pili Nalike, Village Santhes)
  5. *Art & Handicrafts* (Chitra Santhe, Surajkund Mela)
  6. *Cuisine & Food Fairs* (Prasada banquets, Traditional Sadyas)
- **Zero Dead-End Search:** Dynamic fallback mechanism that recommends regional alternatives if exact query parameters return no matches.

### 4.2 Interactive Cultural Calendar
- Supports multi-day festival spans with visual indicators.
- Quick date filtering for today, this weekend, upcoming month, or custom lunar phases.
- Synchronized event drawer displaying immediate festival summaries upon clicking any calendar day.

### 4.3 Geospatial Mapping & Local Navigation
- Interactive OpenStreetMap integration.
- Exact GPS coordinates for temples, maidan grounds, and procession start points.
- "Get Directions" link opening Google Maps / Apple Maps directly from the festival detail page.

### 4.4 Community Contribution & Moderation Pipeline
1. **Public Submission:** Any registered cultural contributor can submit festivals with title, city, dates, venue, historical backstory, and verification source URL.
2. **Duplication Guard:** Algorithmic duplicate detection checking for identical city, venue, and overlapping dates.
3. **Pending Review State:** Submissions are held in a pending state until vetted by administrators.
4. **Admin Moderation Dashboard:**
   - One-click Approve / Reject with mandatory feedback reason.
   - Live resolution of user inaccuracy reports (e.g., date rescheduling, cancellations).
   - Real-time festival distribution metrics across Indian states.

### 4.5 Dual-Language Architecture (English & Kannada)
- Context-based translation engine without external API latency.
- Full UI localization covering navigation, search placeholders, headers, submission forms, and cultural metadata.

---

## 5. Database Schema & Data Modeling

The platform operates on six structured collections:

```
┌──────────────┐          ┌──────────────┐          ┌────────────────┐
│    Users     │          │    Events    │          │     Cities     │
├──────────────┤          ├──────────────┤          ├────────────────┤
│ _id          │          │ _id          │          │ _id            │
│ name         │          │ title        │          │ name           │
│ email        │◄─────────┤ slug         │          │ state          │
│ password     │(CreatedBy│ city         ├─────────►│ coordinates    │
│ role         │          │ category     │          │ coverImage     │
│ savedEvents  │          │ startDate    │          │ heritageBrief  │
│ createdAt    │          │ endDate      │          └────────────────┘
└──────────────┘          │ coordinates  │
                          │ status       │          ┌────────────────┐
                          │ isVerified   │          │ Event Reports  │
                          │ isFeatured   │          ├────────────────┤
                          └──────┬───────┘          │ _id            │
                                 │                  │ eventId ───────┤
                                 ▼                  │ issueType      │
                          ┌──────────────┐          │ reporterEmail  │
                          │  Moderation  │          │ status         │
                          ├──────────────┤          └────────────────┘
                          │ _id          │
                          │ eventId      │
                          │ reviewerId   │
                          │ decision     │
                          │ reason       │
                          └──────────────┘
```

---

## 6. Security & Performance Highlights

1. **Password Encryption:** Salted bcrypt hashing with 10 calculation rounds.
2. **Stateless JWT Authorization:** Bearer token headers with role verification middleware (`protect` and `authorize`).
3. **HTTP Header Hardening:** Automated Helmet middleware securing HTTP headers against XSS, clickjacking, and MIME sniffing.
4. **Bundle Optimization:** Code-split Vite production bundles with Gzip compression reducing CSS to 6.5 KB and JS assets.
5. **CORS Governance:** Explicit origins permitted to ensure clean cross-origin resource sharing between Vercel and Render.

---

## 7. Verification, Testing & Quality Assurance

- **End-to-End API Testing:** Rigorous endpoint verification across `/api/auth`, `/api/events`, `/api/cities`, and `/api/admin`.
- **Cross-Browser Verification:** Tested on Chromium, Firefox, and WebKit rendering engines on desktop and mobile viewports.
- **Accessibility Standards:** High contrast cultural color palette (heritage maroon, deep saffron, rich gold) verified for WCAG AA compliance.

---

## 8. Deployment Architecture

- **Frontend:** Hosted on **Vercel** with global Edge CDN network, instant Git continuous deployment, and SPA rewrite routing (`client/vercel.json`).
- **Backend:** Hosted on **Render** utilizing Node.js runtime environment, environment variable management, and continuous delivery from GitHub branch `main`.

---

## 9. Future Scope & Roadmap

1. **Native Mobile App (React Native / Flutter):** Offline access to temple itineraries and festival routes.
2. **Push Notifications & Reminders:** Automated alerts 24 hours prior to procession starts.
3. **AI Cultural Guide:** Voice-enabled assistant answering questions about mythological backstories and etiquette.
4. **Integration with State Tourism APIs:** Direct feeds from Karnataka Tourism, Kerala Tourism, and Incredible India.
5. **Printable Cultural Calendars:** Automated PDF generator creating regional festival calendars for households.

---

## 10. Conclusion

**Utsav Darshan** fulfills all core deliverables of the Unified Mentor Capstone Internship. It bridges the critical divide between rich Indian cultural traditions and modern digital accessibility. By pairing an intuitive, responsive frontend with a secure, moderated backend, the platform demonstrates full-stack software engineering rigor, clean code architecture, and cultural relevance.

---
*(End of Detailed Project Report)*
