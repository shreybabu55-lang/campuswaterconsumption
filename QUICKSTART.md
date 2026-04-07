# 🚀 Quick Start Guide - Water Management System

Get up and running in 5 minutes!

## Prerequisites
- ✅ Node.js installed (v16+)
- ✅ MongoDB installed and running

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 2: Seed Database

```bash
cd backend
npm run seed
```

This will create sample data including users, buildings, meters, and readings.

## Step 3: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:5173

## Step 4: Login

Open http://localhost:5173 in your browser and login with:

- **Admin Portal (http://localhost:5173/admin-portal)**: admin@bitsathy.ac.in / admin123
- **Staff**: staff@campus.edu / password123
- **Student**: student@campus.edu / password123

## 🎉 You're Ready!

Explore the features:
- 📊 **Dashboard** - View consumption stats and alerts
- 🏢 **Buildings** - Manage campus buildings
- 🔧 **Meters** - Monitor water meters
- 📈 **Analytics** - View consumption trends
- 🔔 **Alerts** - Manage system alerts

## Troubleshooting

**MongoDB not running?**
```bash
mongod
```

**Port already in use?**
Change PORT in `backend/.env`

For detailed documentation, see [walkthrough.md](file:///C:/Users/shrey/.gemini/antigravity/brain/48a29a29-4278-424f-8eaf-ed6f8b1df8b1/walkthrough.md)
