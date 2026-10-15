# Technical Architecture & Demonstration Guide: Utsav Darshan

## 1. System Architecture

```
+-----------------------------------------------------------+
|                   Client (React + Vite)                   |
|  - Tailwind CSS Heritage Theme (Ivory, Maroon, Gold)     |
|  - Leaflet Map Engine (OpenStreetMap Tiles)               |
|  - Recharts Visual Analytics                              |
|  - React Router (Role Protected Route wrappers)          |
+-----------------------------+-----------------------------+
                              | REST JSON (Axios/Fetch)
                              v
+-----------------------------------------------------------+
|                 Server (Node.js + Express)                |
|  - Helmet & CORS Security Headers                         |
|  - JWT Authentication Middleware                          |
|  - Duplicate Event Detection Algorithm                    |
|  - Moderation Log Audit Trail                             |
+-----------------------------+-----------------------------+
                              | Mongoose ODM
                              v
+-----------------------------------------------------------+
|                  Database (MongoDB / Atlas)               |
|  - Collections: Users, Events, Cities, Categories,        |
|    EventReports, ModerationLogs                           |
|  - Zero-Config in-memory fallback for local demonstration |
+-----------------------------------------------------------+
```

## 2. Step-by-Step Viva / Evaluation Demonstration Script

When presenting to evaluators and professors:

1. **Homepage & Cultural Storytelling**:
   - Showcase the hero search with city selectors (Bengaluru, Mysuru, Mangaluru, etc.).
   - Highlight the **Living Traditions** cards and regional focus on **Bengaluru Karaga** and **Mysuru Dasara**.

2. **Event Discovery & Filtering**:
   - Navigate to `/explore`.
   - Test filtering by city (e.g. "Bengaluru"), category ("Temple & Spiritual"), and the "Verified listings only" toggle.
   - Switch between **Grid View** and **List View**.

3. **Cultural Calendar**:
   - Open `/calendar`.
   - Demonstrate the monthly calendar with multi-day spans and click any active date (e.g., October 18, 2026 for Karaga) to reveal the day's event drawer.

4. **Event Details & Interactive Map**:
   - Click into any festival (e.g. *Bengaluru Karaga Shaktyotsava*).
   - Show the OpenStreetMap interactive pinpointing the exact temple coordinates, along with traditions, rituals, and the "Save Event" / "Share" features.

5. **Community Submission & Verification Queue**:
   - Log in as Contributor (`contributor@utsavdarshan.in` / `password123`) or visit `/submit`.
   - Submit a new event with evidence URLs. Note how it enters the `pending` review queue rather than immediately publishing.

6. **Admin Moderation & Analytics**:
   - Log in as Administrator (`admin@utsavdarshan.in` / `password123`) and open `/admin`.
   - Inspect the pending review queue.
   - Perform an approval or request correction with feedback notes.
   - Show the **Recharts analytics** displaying events grouped by city and category.
