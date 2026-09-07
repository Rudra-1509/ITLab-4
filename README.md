# Online Event Ticketing Platform - Backend Microservices Architecture

Production-ready, event-driven Node.js + TypeScript microservices backend built for a university System Design / Software Interface Design project.

## Technology Stack

- **Runtime & Language:** Node.js 20+, TypeScript, Express.js
- **Database & ORM:** PostgreSQL, Prisma ORM
- **In-Memory Cache & Event Bus:** Redis, Redis Streams
- **Security:** JWT, bcrypt password hashing, Zod validation
- **Documentation & Testing:** Swagger / OpenAPI 3.0, Jest, Supertest
- **Containerization:** Docker, Docker Compose

---

## Service Architecture & Port Mappings

| Service Name | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `8000` | Central entry point, HTTP proxying, CORS, Swagger UI (`/docs`), Health Check (`/api/health`) |
| **Auth Service** | `8001` | User registration, authentication, multi-device sessions, logout management |
| **Event Service** | `8002` | Event CRUD, automatic seat generation (50 seats/event), seat availability map |
| **Booking Service** | `8003` | Seat locking (Redis atomic `SET NX EX`), checkout transactions, payment simulation, QR code tickets |
| **Pricing Service** | `8004` | Deterministic dynamic pricing based on capacity occupancy and start time proximity |
| **Analytics Service** | `8005` | Event-driven analytics aggregator consuming Redis Streams (`analytics-group`) |
| **Notification Service** | `8006` | Event-driven user notification processor consuming Redis Streams (`notification-group`) |

---

## Quickstart & Environment Setup

### 1. Prerequisites
- Node.js 20+ installed
- PostgreSQL & Redis running locally (or via Docker Compose)
- Docker Desktop (optional for container deployment)

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Setup & Seeding
Generate Prisma Client, push database schema, and seed demo accounts:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

---

## Demo Credentials

The seed script creates 3 demo accounts with password `password123`:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `password123` | Platform wide analytics, health checks, full event CRUD |
| **Organizer** | `organizer@example.com` | `password123` | Event creation, edit, cancel, event-level analytics |
| **Audience** | `user@example.com` | `password123` | Seat locking, booking checkout, multi-device sessions, tickets |

---

## Running the Backend

### Option A: Local Development Mode (Node.js / ts-node)
In separate terminal tabs:
```bash
npm run start:gateway
npm run start:auth
npm run start:events
npm run start:bookings
npm run start:pricing
npm run start:analytics
npm run start:notifications
```

### Option B: Docker Compose Deployment (Recommended)
Build and run the entire platform with PostgreSQL and Redis containers:
```bash
docker compose -f docker-compose.backend.yml up --build
```

---

## Running the Frontend Client (TicketPulse)

The frontend is built with React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Recharts, and Lucide React.

```bash
# Option 1: From the root directory
npm run start:frontend

# Option 2: From the frontend directory
cd frontend
npm install
npm run dev
```

Navigate to:
**`http://localhost:3000`**

### Demo Credentials:
- **Audience:** `user@example.com` / `password123`
- **Organizer:** `organizer@example.com` / `password123`
- **Admin:** `admin@example.com` / `password123`

---

## Swagger API Documentation

Once started, navigate to:
**`http://localhost:8000/docs`**

You can test all interactive REST endpoints directly from Swagger UI!

---

## Automated Test Suite

Run all unit, integration, multi-device, and high-concurrency race condition tests:
```bash
npm test
```

### Critical Tests Covered:
1. **Concurrent Seat Locking Test:** Simulates User A and User B attempting to lock the exact same seat simultaneously. Verifies 1x `200 OK` and 1x `409 Conflict` via Redis `SET NX EX`.
2. **Multi-Device Authentication Test:** Verifies simultaneous logins from multiple physical devices, independent session tracking, single-session revocation, and global logout-all.
3. **Fault Tolerance Test:** Verifies Booking Service fallback to base price when Pricing Service is down.
4. **Health Checks:** Verifies system health reports across all microservices.

---

## Architectural Documentation
- [api-contract.md](file:///c:/Users/RUDRANIL%20MONDAL/Documents/Web%20developement/Projects/7th%20Sem/Project4/docs/api-contract.md)
- [architecture.md](file:///c:/Users/RUDRANIL%20MONDAL/Documents/Web%20developement/Projects/7th%20Sem/Project4/docs/architecture.md)
- [event-flow.md](file:///c:/Users/RUDRANIL%20MONDAL/Documents/Web%20developement/Projects/7th%20Sem/Project4/docs/event-flow.md)
- [database.md](file:///c:/Users/RUDRANIL%20MONDAL/Documents/Web%20developement/Projects/7th%20Sem/Project4/docs/database.md)
