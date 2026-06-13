# 🎓 CampusConnect — University Service Marketplace

A full-stack web application where university students can **offer and find services** — tutoring, design, photography, moving help, and more. Users can act as both a **Service Provider** and a **Service Seeker** simultaneously.

---

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | React 19 + Vite + Tailwind CSS v4 |
| Backend        | Node.js + Express                 |
| Database       | PostgreSQL via Supabase           |
| ORM            | Prisma                            |
| Authentication | JWT (access + refresh tokens)     |
| Hosting        | Vercel (frontend) + Supabase (DB) |

---

## 📁 Project Structure

```
Maincampusconnect/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React context (Auth)
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # API client (Axios)
│   │   └── pages/        # Page components
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/               # Express API server
│   ├── src/
│   │   ├── config/       # Environment config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth, validation, errors
│   │   ├── routes/       # Express routers
│   │   └── utils/        # JWT helpers, error classes
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.js       # Seed data
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **Supabase** account (free tier works) — [supabase.com](https://supabase.com)

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Maincampusconnect
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once created, go to **Project Settings → Database**.
3. Copy the **Connection string** (URI tab):
   - **Connection pooling** string (port `6543`) → this is your `DATABASE_URL`
   - **Direct connection** string (port `5432`) → this is your `DIRECT_URL`
4. Replace `[YOUR-PASSWORD]` in the connection strings with your database password.

### 3. Configure Server Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
JWT_ACCESS_SECRET="<generate-a-random-64-char-hex-string>"
JWT_REFRESH_SECRET="<generate-a-different-random-64-char-hex-string>"
```

Generate JWT secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Install Dependencies & Set Up Database

```bash
# Install server dependencies
cd server
npm install

# Push schema to Supabase (creates tables)
npx prisma db push

# Generate Prisma client
npx prisma generate

# (Optional) Seed the database with sample data
npm run db:seed
```

### 5. Configure Client Environment

```bash
cd ../client
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:5000/api` works for local dev.

### 6. Install Client Dependencies

```bash
npm install
```

### 7. Start Both Servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

The app is now running at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health check:** http://localhost:5000/api/health

### Seed Account Credentials

If you ran the seed script, these test accounts are available:

| Email                 | Password      | Roles              |
| --------------------- | ------------- | ------------------ |
| alice@university.edu  | password123   | Provider + Seeker  |
| bob@university.edu    | password123   | Provider + Seeker  |
| carol@university.edu  | password123   | Seeker             |

---

## 🌐 Deployment

### Deploy Frontend to Vercel

1. Push your code to GitHub/GitLab.
2. Go to [vercel.com](https://vercel.com) and import your repository.
3. Configure the project:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend-url.com/api`
5. Deploy.

### Deploy Backend

For the Express backend, you can deploy to any Node.js host (Railway, Render, Fly.io, etc.):

#### Option A: Railway

1. Create a new project on [railway.app](https://railway.app).
2. Connect your GitHub repo and set the root directory to `server`.
3. Add environment variables from `server/.env.example`.
4. Railway auto-detects Node.js and runs `npm start`.

#### Option B: Render

1. Create a new Web Service on [render.com](https://render.com).
2. Connect your repo, set root directory to `server`.
3. **Build Command:** `npm install && npx prisma generate`
4. **Start Command:** `npm start`
5. Add all environment variables.

### Database (Supabase)

Your Supabase PostgreSQL database is already cloud-hosted. No extra deployment needed — just make sure your backend's `DATABASE_URL` and `DIRECT_URL` point to your Supabase project.

**Important:** Update `CLIENT_URL` in your backend environment to your Vercel frontend URL for CORS to work in production.

---

## 📡 API Reference

### Auth
| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| POST   | `/api/auth/register`| Create account     |
| POST   | `/api/auth/login`   | Login              |
| POST   | `/api/auth/refresh` | Refresh JWT        |
| POST   | `/api/auth/logout`  | Logout             |

### Services
| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| GET    | `/api/services`      | List/search/filter  |
| GET    | `/api/services/:id`  | Get service detail  |
| POST   | `/api/services`      | Create service 🔒   |
| PUT    | `/api/services/:id`  | Update own service 🔒|
| DELETE | `/api/services/:id`  | Deactivate service 🔒|

### Bookings
| Method | Endpoint                     | Description          |
| ------ | ---------------------------- | -------------------- |
| POST   | `/api/bookings`              | Book a service 🔒    |
| GET    | `/api/bookings/my`           | Get my bookings 🔒   |
| PATCH  | `/api/bookings/:id/status`   | Update status 🔒     |

### Reviews
| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| POST   | `/api/reviews`                    | Leave a review 🔒     |
| GET    | `/api/reviews/service/:serviceId` | Get service reviews   |

### Users
| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| GET    | `/api/users/me`   | Get own profile 🔒|
| PUT    | `/api/users/me`   | Update profile 🔒 |
| GET    | `/api/users/:id`  | Public profile    |

🔒 = Requires JWT authentication

---

## 🗄️ Database Schema

**User Roles:** A single user can hold both `PROVIDER` and `SEEKER` roles via the `activeRoles` array field. No need for separate accounts.

**Models:** User, Service, Booking, Review

**Enums:**
- `ServiceCategory`: TUTORING, DESIGN, PHOTOGRAPHY, MOVING, CLEANING, TECH_SUPPORT, WRITING, FITNESS, MUSIC, OTHER
- `PricingType`: HOURLY, FIXED, FREE
- `BookingStatus`: PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED

See `server/prisma/schema.prisma` for the full schema definition.

---

## 🛠️ Useful Commands

```bash
# Server
cd server
npm run dev              # Start dev server with auto-reload
npm run db:generate      # Regenerate Prisma client
npm run db:migrate       # Run migrations
npm run db:push          # Push schema to DB (no migration)
npm run db:seed          # Seed sample data
npm run db:studio        # Open Prisma Studio (GUI)

# Client
cd client
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

---

## License

MIT
