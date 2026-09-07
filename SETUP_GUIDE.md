# Setup & Deployment Guide - Online Event Ticketing Platform

---

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Database Initialization](#database-initialization)
4. [Running Tests](#running-tests)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop
- 4 GB RAM minimum

### Steps

```bash
# 1. Clone/navigate to repository
cd ITLab-4

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Start Docker services
docker compose -f docker-compose.backend.yml up -d

# 5. Initialize database
docker run --rm --network itlab-4_default \
  -v $(pwd):/app -w /app \
  -e "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ticketing_db?schema=public" \
  node:20 bash -c "npm install && npx prisma db push --schema=./backend/prisma/schema.prisma --skip-generate && npm run seed"

# 6. Verify services
docker compose -f docker-compose.backend.yml ps

# 7. Access API
# Swagger UI: http://localhost:8000/docs
# Gateway: http://localhost:8000
```

**Expected Output:**
```
NAME                             STATUS
ticketing_gateway                Up (healthy)
ticketing_auth_service           Up (healthy)
ticketing_event_service          Up (healthy)
ticketing_booking_service        Up (healthy)
ticketing_pricing_service        Up (healthy)
ticketing_analytics_service      Up (healthy)
ticketing_notification_service   Up (healthy)
ticketing_postgres               Up (healthy)
ticketing_redis                  Up (healthy)
```

---

## Detailed Setup

### 1. Prerequisites Installation

#### macOS/Linux
```bash
# Install Node.js 20 (using Homebrew)
brew install node@20
brew link node@20 --force

# Install Docker Desktop
brew install docker

# Start Docker daemon
open /Applications/Docker.app
```

#### Windows
```powershell
# Install Node.js 20 using Chocolatey
choco install nodejs --version=20.0

# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Then start Docker Desktop from Start menu
```

#### Verify Installations
```bash
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
docker --version  # Should show Docker version 20+
docker compose --version  # Should show version 2.x.x
```

### 2. Repository Setup

```bash
# Navigate to project
cd ITLab-4

# Install Node dependencies
npm install

# Expected output: "added 462 packages"
```

### 3. Environment Configuration

```bash
# Copy template to actual env file
cp .env.example .env

# Review settings (optional)
cat .env
```

**Key Environment Variables:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/ticketing_db?schema=public` | PostgreSQL connection for Docker |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection for Docker |
| `JWT_SECRET` | `super-secret-jwt-key-change-in-production-12345` | ⚠️ Change for production |
| `PORT` | `8000` | Gateway port |
| `JWT_EXPIRES_IN` | `1d` | Token expiration time |

### 4. Docker Services Setup

#### Build Images
```bash
docker compose -f docker-compose.backend.yml build

# Expected: All 7 services built successfully
```

#### Start Services
```bash
docker compose -f docker-compose.backend.yml up -d

# Expected: "9/9 services started"
```

#### Verify Health
```bash
docker compose -f docker-compose.backend.yml ps

# All containers should show status "Up" and "(healthy)"
```

#### View Logs
```bash
# All services
docker compose -f docker-compose.backend.yml logs

# Specific service
docker compose -f docker-compose.backend.yml logs gateway

# Last 50 lines
docker compose -f docker-compose.backend.yml logs --tail=50

# Real-time log stream
docker compose -f docker-compose.backend.yml logs -f gateway
```

---

## Database Initialization

### Method 1: Docker Container (Recommended) ✅

Best for Windows/Mac users with Docker Desktop.

```bash
# Run initialization in Docker container
docker run --rm --network itlab-4_default \
  -v $(pwd):/app -w /app \
  -e "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ticketing_db?schema=public" \
  -e "JWT_SECRET=super-secret-jwt-key-change-in-production-12345" \
  node:20 bash -c "npm install && npx prisma db push --schema=./backend/prisma/schema.prisma --skip-generate && npm run seed"

# Expected output:
# "Seeding database..."
# "Demo Users created: admin@example.com, organizer@example.com, user@example.com"
# "7 events created with automatic seat generation"
```

**What This Does:**
1. Runs a temporary Node container
2. Installs npm dependencies
3. Pushes Prisma schema to PostgreSQL (creates tables)
4. Seeds database with demo data
5. Container automatically removed

### Method 2: Host Machine

Only if PostgreSQL and Redis are running locally on your machine.

```bash
# Generate Prisma Client
npx prisma generate --schema=./backend/prisma/schema.prisma

# Push schema to database
npx prisma db push --schema=./backend/prisma/schema.prisma

# Seed demo data
npm run seed
```

### Verify Database Initialization

```bash
# Check tables were created
docker compose -f docker-compose.backend.yml exec -T postgres psql -U postgres -d ticketing_db -c "\dt"

# Expected output: List of tables (User, Event, Seat, Booking, etc.)
```

### Seed Data Details

After initialization, database contains:

**Users (3 demo accounts):**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "role": "ADMIN"
},
{
  "email": "organizer@example.com",
  "password": "password123",
  "role": "ORGANIZER"
},
{
  "email": "user@example.com",
  "password": "password123",
  "role": "AUDIENCE"
}
```

**Events (7 sample events):**
- 3 Concerts (Grand Symphony Orchestra, Rock Fest 2026, Electronic Beats Night)
- 2 Theater (Shakespeare in the Park, Comedy Night)
- 2 Sports (Basketball Championship, Soccer Tournament)

Each event has:
- 50 seats (initially all AVAILABLE)
- Varied pricing (600-1500)
- Full metadata and images

---

## Running Tests

### Prerequisites
- Database initialized (see Database Initialization)
- All Docker services running

### Run All Tests
```bash
npm test

# Expected output:
# Test Suites: 3 passed, 3 total
# Tests: 6 passed, 6 total
# Redis concurrent seat locking ✅
# Multi-device authentication ✅
# Pricing + health checks ✅
```

### Run Specific Test
```bash
# Run concurrency tests only
npx jest backend/tests/concurrency.test.ts

# Run multidevice tests
npx jest backend/tests/multidevice.test.ts

# Run pricing and health tests
npx jest backend/tests/pricing-and-health.test.ts
```

### Test Description

1. **Concurrency Test** (`concurrency.test.ts`)
   - Simulates two users locking the same seat simultaneously
   - Verifies Redis atomic `SET NX EX` operation
   - Expected: One succeeds (200 OK), one fails (409 Conflict)

2. **Multi-Device Test** (`multidevice.test.ts`)
   - User logs in from 3 different "devices"
   - Each device gets separate session
   - Tests revoking single session and logout-all
   - Verifies JWT token independence

3. **Pricing & Health Test** (`pricing-and-health.test.ts`)
   - Checks pricing algorithm calculations
   - Verifies health endpoints across all services
   - Tests booking fallback when pricing service down
   - Expected: All services report "healthy"

---

## Development Workflow

### Local Development (Non-Docker)

Useful for debugging individual services.

```bash
# Terminal 1: Start Gateway
npm run start:gateway

# Terminal 2: Start Auth Service
npm run start:auth

# Terminal 3: Start Event Service  
npm run start:events

# Terminal 4: Start Booking Service
npm run start:bookings

# Terminal 5: Start Pricing Service
npm run start:pricing

# Terminal 6: Start Analytics Service
npm run start:analytics

# Terminal 7: Start Notifications Service
npm run start:notifications
```

**Requirements:**
- PostgreSQL running locally on port 5432
- Redis running locally on port 6379
- Update `.env` to use `localhost` instead of service names

### Docker Development

Recommended approach with live reloading (if configured).

```bash
# Start services
docker compose -f docker-compose.backend.yml up

# In another terminal, watch logs
docker compose -f docker-compose.backend.yml logs -f

# Make code changes - Docker will rebuild automatically with --build flag
docker compose -f docker-compose.backend.yml up --build

# Stop services
docker compose -f docker-compose.backend.yml down

# Remove volumes (reset database)
docker compose -f docker-compose.backend.yml down -v
```

### Building Frontend

```bash
# From root directory
npm run start:frontend

# From frontend directory
cd frontend
npm install
npm run dev

# Access at http://localhost:3000
```

---

## Troubleshooting

### Issue: "Port already in use"

**Symptom:**
```
failed to bind port: port is already allocated
```

**Solution:**
```bash
# Find process using port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8000  # Gateway

# Kill process (macOS/Linux)
kill -9 <PID>

# Or stop Docker containers
docker compose -f docker-compose.backend.yml down
```

### Issue: "Can't reach database server"

**Symptom:**
```
P1001: Can't reach database server at `localhost:5432`
```

**Solution:**
```bash
# Check if containers are running
docker compose -f docker-compose.backend.yml ps

# If not running, start them
docker compose -f docker-compose.backend.yml up -d

# If database container is running but not responsive
docker compose -f docker-compose.backend.yml restart postgres

# Check database logs
docker logs ticketing_postgres
```

### Issue: "DATABASE_URL not set"

**Symptom:**
```
Error: Environment variable not found: DATABASE_URL
```

**Solution:**
```bash
# Create .env from template
cp .env.example .env

# Verify file exists
cat .env

# Reload environment
source .env  # macOS/Linux
$env:DATABASE_URL = "..."  # PowerShell
```

### Issue: Tests failing with "ECONNREFUSED"

**Symptom:**
```
connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Ensure database is initialized
docker compose -f docker-compose.backend.yml exec -T postgres psql -U postgres -d ticketing_db -c "SELECT 1"

# If no tables, run initialization again
docker run --rm --network itlab-4_default \
  -v $(pwd):/app -w /app \
  -e "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ticketing_db?schema=public" \
  node:20 bash -c "npm install && npx prisma db push --schema=./backend/prisma/schema.prisma --skip-generate && npm run seed"
```

### Issue: Docker network issues

**Symptom:**
```
network itlab-4_default not found
```

**Solution:**
```bash
# Remove and recreate network
docker compose -f docker-compose.backend.yml down
docker network prune
docker compose -f docker-compose.backend.yml up -d
```

### Issue: Seed script fails with cryptographic errors

**Symptom:**
```
TypeError: Cannot read property 'generate' of undefined
```

**Solution:**
```bash
# Ensure bcrypt is installed
npm install bcryptjs

# Ensure qrcode is installed
npm install qrcode

# Try seed again
npm run seed
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Update service URLs if deploying to different servers
- [ ] Configure SSL/TLS certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Review security settings
- [ ] Test load with realistic data volumes

### Docker Production Deployment

#### Option 1: Docker Compose on Single Server

```bash
# Pull latest images
docker compose -f docker-compose.backend.yml pull

# Start services with resource limits
docker compose -f docker-compose.backend.yml up -d

# Verify all services healthy
docker compose -f docker-compose.backend.yml ps
```

#### Option 2: Kubernetes (Advanced)

```bash
# Generate Kubernetes manifests from compose (requires kompose)
kompose convert -f docker-compose.backend.yml

# Deploy to Kubernetes
kubectl apply -f .
```

### Environment Configuration for Production

```env
# production.env
DATABASE_URL="postgresql://prod_user:STRONG_PASSWORD@db.prod.example.com:5432/ticketing_db?schema=public&sslmode=require"
REDIS_URL="redis://:PASSWORD@redis.prod.example.com:6379"
JWT_SECRET="GENERATE_STRONG_SECRET_KEY_HERE"
JWT_EXPIRES_IN="7d"
PORT=8000
NODE_ENV="production"
AUTH_SERVICE_URL="https://api.prod.example.com:8001"
EVENT_SERVICE_URL="https://api.prod.example.com:8002"
BOOKING_SERVICE_URL="https://api.prod.example.com:8003"
PRICING_SERVICE_URL="https://api.prod.example.com:8004"
ANALYTICS_SERVICE_URL="https://api.prod.example.com:8005"
NOTIFICATION_SERVICE_URL="https://api.prod.example.com:8006"
FRONTEND_URL="https://app.prod.example.com"
```

### Database Backup

```bash
# Manual backup
docker compose -f docker-compose.backend.yml exec -T postgres pg_dump -U postgres ticketing_db > backup.sql

# Backup with date
docker compose -f docker-compose.backend.yml exec -T postgres pg_dump -U postgres ticketing_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
cat backup.sql | docker compose -f docker-compose.backend.yml exec -T postgres psql -U postgres -d ticketing_db
```

### Monitoring & Logs

```bash
# View all logs
docker compose -f docker-compose.backend.yml logs

# Follow logs in real-time
docker compose -f docker-compose.backend.yml logs -f

# View specific service logs
docker compose -f docker-compose.backend.yml logs auth-service

# Export logs to file
docker compose -f docker-compose.backend.yml logs > logs_$(date +%Y%m%d).txt
```

### Health Checks

```bash
# Check gateway health
curl http://localhost:8000/api/health

# Check individual service health
curl http://localhost:8001/health  # Auth
curl http://localhost:8002/health  # Events
curl http://localhost:8003/health  # Bookings
curl http://localhost:8004/health  # Pricing
curl http://localhost:8005/health  # Analytics
curl http://localhost:8006/health  # Notifications
```

---

## Summary

You now have a complete, production-ready Online Event Ticketing Platform backend:

✅ **Infrastructure:** Docker Compose with 9 services  
✅ **Database:** PostgreSQL with Prisma ORM  
✅ **Caching:** Redis for seat locking and events  
✅ **API:** Swagger UI with complete documentation  
✅ **Tests:** Comprehensive test suite  
✅ **Security:** JWT authentication and authorization  

**Next Steps:**
1. Follow the Quick Start above
2. Initialize database
3. Run tests to verify setup
4. Access Swagger UI at http://localhost:8000/docs
5. Deploy to production following guidelines

For more information, see:
- [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/api-contract.md](docs/api-contract.md)

---

*Last Updated: September 7, 2026*
