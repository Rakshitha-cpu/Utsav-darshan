# 🌐 Utsav Darshan — Deployment & Hosting Guide

This guide explains how to deploy **Utsav Darshan** online for free using popular hosting platforms (**Render**, **Vercel**, or **Railway**).

---

## 🚀 Option 1: 1-Click All-in-One Deployment on Render (Free & Recommended)

With our built-in production static file server, your entire React Frontend and Node.js Backend can run together on **one single free service** on [Render.com](https://render.com).

### Step 1: Push Code to GitHub
1. Create a free GitHub account if you don't already have one.
2. Initialize and push your `utsav-darshan` folder to a new private or public GitHub repository:
   ```bash
   cd C:\Users\User\OneDrive\Desktop\utsav-darshan
   git init
   git add .
   git commit -m "Initial commit of Utsav Darshan platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/utsav-darshan.git
   git push -u origin main
   ```

### Step 2: Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository `utsav-darshan`.
3. Configure the settings:
   * **Name**: `utsav-darshan`
   * **Environment**: `Node`
   * **Region**: `Singapore (Southeast Asia)` or `Frankfurt`
   * **Branch**: `main`
   * **Root Directory**: Leave blank (root)
   * **Build Command**:
     ```bash
     cd client && npm install && npm run build && cd ../server && npm install
     ```
   * **Start Command**:
     ```bash
     cd server && npm start
     ```
   * **Plan**: `Free`
4. Click **Create Web Service**.
5. Render will build the frontend, seed the database, and give you a live URL like:  
   👉 **`https://utsav-darshan.onrender.com`**

---

## ⚡ Option 2: Split Deployment (Vercel Frontend + Render Backend)

If you prefer deploying the React frontend on Vercel's global CDN:

### Part A: Deploy Backend on Render
1. Select the `server` directory as the root.
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Copy your backend URL (e.g., `https://utsav-darshan-api.onrender.com`).

### Part B: Deploy Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and import your GitHub repo.
2. Select the **Root Directory** as `client`.
3. Under **Environment Variables**, add:
   * `VITE_API_URL` = `https://utsav-darshan-api.onrender.com`
4. Click **Deploy**. Vercel will give you a live URL in under 60 seconds!

---

## 🐳 Option 3: Docker Deployment (Any Cloud: AWS / GCP / Azure)

A `Dockerfile` can be run anywhere. Simply build and run:
```bash
docker build -t utsav-darshan .
docker run -p 5000:5000 utsav-darshan
```

---

## 🔑 Default Production Test Credentials

Once deployed, anyone evaluating your site can log in with:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@utsavdarshan.in` | `password123` | Full moderation queue, approve/reject submissions, analytics |
| **Contributor** | `contributor@utsavdarshan.in` | `password123` | Submit festivals, view submission review status |
| **User** | `user@utsavdarshan.in` | `password123` | Bookmark festivals, post community reviews |
