# HotelJobs.com

India's #1 Hospitality Job Portal — connecting hotel & restaurant professionals with top employers across India.

## 🚀 Quick Start (Local)

```bash
# 1. Start MongoDB
net start MongoDB

# 2. Start backend (port 5000)
cd server && npm install && npm run dev

# 3. Start frontend (port 3000)
cd client && npm install && npm run dev

# 4. Seed database (first time only)
cd server && npm run seed
```

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Seeker | rahul.sharma@gmail.com | seeker123 |
| Recruiter | hr@tajhotels.com | recruiter123 |
| Admin | admin@hoteljobs.com | admin123 |

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT

## 📁 Structure

```
├── client/     # React frontend
└── server/     # Express API
```
