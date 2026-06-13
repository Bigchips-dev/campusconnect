# CampusConnect 🎓

A university service marketplace that connects students and staff 
who need services with those who offer them — all within a single campus.

Whether you need a tutor, a barber, a graphic designer, or a meal 
delivered to your hostel, CampusConnect makes it easy to find and 
book services from people right on your campus.

---

## What It Does

- **Service Seekers** can browse 18 service categories, view provider 
  profiles, book services, and message providers directly
- **Service Providers** can list their services, manage bookings, 
  and grow their reputation through reviews and ratings
- **Dual-role users** can do both at the same time from one account

---

## Service Categories

Academic & Tutoring · Food & Catering · Beauty & Grooming · 
Tech & Digital · Fashion & Clothing · Home & Repair · 
Health & Wellness · Creative Arts · Logistics & Errands · 
Spiritual & Cultural · Writing Help · Phone & Laptop Repair · 
Research & Study Help · Sports & Fitness · Housing & Campus Life · 
Printing & Media Services · Buy, Sell & Rent · Career & Self Growth

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.io |
| Hosting | Vercel (frontend) + Railway (backend) + Supabase (database) |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js >= 18
- npm >= 9
- A Supabase account — supabase.com

### 1. Clone the repository
git clone https://github.com/Bigchips-dev/campusconnect.git

cd campusconnect

### 2. Set up environment variables

**Server:**
cd server

cp .env.example .env
Fill in your Supabase database URLs and JWT secrets in `server/.env`

**Client:**
cd ../client

cp .env.example .env
Set `VITE_API_URL=http://localhost:5000/api` for local development

### 3. Install dependencies
Server
cd server

npm install
Client
cd ../client

npm install

### 4. Set up the database
cd server

npx prisma db push

npx prisma generate

npm run db:seed

### 5. Start the app

Open two terminals:

**Terminal 1 — Backend:**
cd server

npm run dev

**Terminal 2 — Frontend:**
cd client

npm run dev

The app runs at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Deployment

| Part | Platform |
|------|---------|
| Frontend | Vercel |
| Backend | Railway |
| Database | Supabase |

---

## Project Status

🚧 Currently in active development — targeting initial launch 
at a single university before wider expansion.

---

## Author

Built by [@Bigchips-dev](https://github.com/Bigchips-dev)
