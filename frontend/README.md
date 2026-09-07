# Online Event Ticketing Platform - Frontend Client (TicketPulse)

Production-ready, modern React + TypeScript single-page application built for an Online Event Ticketing Platform.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router v6**, **Axios**, **Recharts**, and **Lucide React**.

---

## Key Highlights & Architectural Features

1. **Commercial Ticketing Platform UX:**
   - Dark-mode first, glassmorphic navigation bar with role-specific items.
   - Comprehensive event discovery with instant keyword search, category filters (Concerts, Theater, Sports), city selection, and price sliders.
   - Interactive SVG/Canvas seat maps with STAGE visualization and real-time visual states: Available, Selected, Locked, Sold.

2. **Atomic Redis Seat Locking & 5-Minute Countdown:**
   - Seat selection triggers atomic seat locking via the API Gateway (`POST /api/bookings/lock`).
   - Active countdown timer (`Seat locked for 04:32`) updating every second.
   - Automatic seat map refresh and state expiration if the 5-minute reservation timer elapses.

3. **Deterministic Dynamic Pricing Visualization:**
   - Real-time price breakdown card showing Base Price, Demand Surge (+25% / +40%), Proximity Surge (+10%), and current calculated dynamic ticket price.
   - Venue occupancy progress bar.

4. **Simulated Payment Gateway & Digital Pass:**
   - University project simulated payment flow supporting both Successful Payment and Failed Payment simulations.
   - Digital admission pass with perforated tear-off styling, gate QR code validation, and print-ready CSS (`@media print`).

5. **Multi-Device Authentication & Granular Revocation:**
   - Simultaneous logins on multiple devices (e.g. Windows PC, Linux laptop, Mobile) without premature logouts.
   - Interactive Active Sessions management with individual device revocation (`DELETE /api/auth/sessions/:id`) and global revocation (`POST /api/auth/logout-all`).

6. **Organizer & Admin Dashboards with Recharts:**
   - Organizer revenue trends (AreaChart), tickets sold by event (BarChart), occupancy percentages, and event creation workflow.
   - Admin platform-wide telemetry, Gross Booking Value (GBV) analytics, and cluster health monitoring.

7. **Service Health UI (`/admin/health`):**
   - Direct integration with backend `/api/health` endpoint reporting diagnostic states across all 8 backend microservices:
     - Auth Service
     - Event Service
     - Booking Service
     - Pricing Service
     - Analytics Service
     - Notification Service
     - Redis distributed streams and locks
     - PostgreSQL database

---

## Project Structure

```
frontend/src/
├── api/                  # Dedicated API Gateway integration layer
│   ├── client.ts         # Axios instance, Bearer token interceptor, 401/403 handlers
│   ├── auth.api.ts       # Register, login, me, sessions, revoke, logout
│   ├── events.api.ts     # List events, details, seat map, CRUD
│   ├── pricing.api.ts    # Dynamic pricing calculations
│   ├── bookings.api.ts   # Lock seat, create booking, simulate payment
│   ├── tickets.api.ts    # User tickets, pass verification
│   ├── notifications.api.ts # User notifications & mark as read
│   ├── analytics.api.ts  # Organizer & Admin analytics
│   ├── health.api.ts     # Service health telemetry
│   └── mockData.ts       # High-fidelity fallback mirroring Prisma seed
├── types/                # Strict TypeScript domain interfaces
│   └── index.ts
├── context/              # Lightweight React Context providers
│   ├── AuthContext.tsx   # Auth state, JWT storage, role access
│   ├── BookingContext.tsx# Selected event, seat locks, 5-min countdown
│   └── ToastContext.tsx  # Floating notifications
├── components/           # Reusable UI component library
│   ├── common/           # Button, Input, Card, Badge, Modal, Navbar, Footer, StatCard...
│   ├── events/           # EventCard, PricingBreakdown...
│   ├── seats/            # SeatMap, SeatItem...
│   └── tickets/          # TicketCard, DigitalTicket...
├── layouts/              # MainLayout, DashboardLayout, ProtectedRoute
├── pages/
│   ├── public/           # HomePage, EventsPage, EventDetailPage, LoginPage, RegisterPage
│   ├── audience/         # AudienceDashboard, Checkout, Success, MyTickets, TicketDetail, Profile, Notifications
│   ├── organizer/        # OrganizerDashboard, OrganizerEvents, CreateEvent, OrganizerAnalytics
│   └── admin/            # AdminDashboard, AdminAnalytics, ServiceHealth
├── utils/                # Currency, date, and countdown formatters
├── App.tsx               # Route declarations & protection guards
└── main.tsx              # DOM mounting
```

---

## Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch on **`http://localhost:3000`** with automated proxying to the API Gateway on `http://localhost:8000`.

### 3. Build for Production
```bash
npm run build
```

---

## 1-Click Demo Credentials

On the **`/login`** page, click any of the 3 quick-login buttons to test different roles:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Audience** | `user@example.com` | `password123` | Browse, lock seats, checkout simulation, tickets, multi-device sessions |
| **Organizer** | `organizer@example.com` | `password123` | Event creation, edit/cancel events, occupancy telemetry, organizer charts |
| **Admin** | `admin@example.com` | `password123` | Platform analytics, platform telemetry, `/admin/health` service monitor |

---

## Route Overview

### Public:
- `/` - Homepage (Hero, search, categories, featured & popular events)
- `/events` - Event catalog with search, filters, and sorting
- `/events/:id` - Event details, dynamic price explanation, seat map selection
- `/login` - Authentication with 1-click demo accounts
- `/register` - Registration with role selection

### Audience:
- `/dashboard` - Personal dashboard & recent bookings
- `/checkout` - Seat lock countdown, price breakdown, payment simulation
- `/booking/success/:bookingId` - Booking confirmation & QR pass trigger
- `/my-tickets` - User ticket pass cards
- `/tickets/:id` - Digital boarding pass with QR code & print mode
- `/profile` - Profile & active multi-device session revocation
- `/notifications` - Alerts and booking updates

### Organizer:
- `/organizer` - Revenue, tickets sold, occupancy, popular events
- `/organizer/events` - Event catalog management
- `/organizer/events/create` - New event form
- `/organizer/events/:id` - Single event seat occupancy matrix
- `/organizer/analytics` - Category and revenue analytics

### Admin:
- `/admin` - Platform-wide overview and cluster status
- `/admin/analytics` - Gross Booking Value (GBV) intelligence
- `/admin/health` - Live microservice health dashboard (8 services + gateway)
