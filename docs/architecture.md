# System Architecture Documentation

## Overview

The **Online Event Ticketing Platform** is designed as a distributed, microservices-based Node.js + TypeScript system utilizing PostgreSQL for transactional data, Redis for atomic seat locking, and Redis Streams for asynchronous event-driven communication.

## Microservices Topology

```
                               ┌─────────────────────────┐
                               │   API Gateway (8000)    │
                               └────────────┬────────────┘
                                            │
        ┌───────────────────┬───────────────┼───────────────┬───────────────────┐
        ▼                   ▼               ▼               ▼                   ▼
┌──────────────┐    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   ┌──────────────┐
│ Auth Service │    │Event Service │ │Booking Svc   │ │Pricing Svc   │   │Analytics Svc │
│ (Port 8001)  │    │(Port 8002)   │ │(Port 8003)   │ │(Port 8004)   │   │(Port 8005)   │
└───────┬──────┘    └───────┬──────┘ └──────┬───────┘ └──────┬───────┘   └──────▲───────┘
        │                   │               │                │                  │
        │                   │        Redis Seat Lock         │                  │ Redis Stream
        │                   │         (NX EX 300)            │                  │ Consumer Group
        │                   │               │                │                  │
        └───────────────────┴───────┬───────┴────────────────┴──────────────────┴──┐
                                    │                                              │
                                    ▼                                              ▼
                      [ PostgreSQL Database ]                      [ Redis Stream: ticketing.events ]
                      (Logical Service Schema)                                     │
                                                                                   ▼
                                                                        ┌──────────────────────┐
                                                                        │ Notification Service │
                                                                        │ (Port 8006)          │
                                                                        └──────────────────────┘
```

## Key Architectural Principles

### 1. API Gateway Routing
The API Gateway acts as the single public-facing HTTP reverse proxy running on port 8000. It routes requests to internal microservices based on URL path prefixes and performs global health checks across all sub-systems.

### 2. Atomic Redis Seat Locking
To eliminate double-booking race conditions during high concurrency:
- Key pattern: `seat_lock:{eventId}:{seatId}`
- Atomic operation: `SET key userId NX EX 300`
- If another user attempts to lock the exact same seat within the 5-minute window, Redis atomically returns `null`, causing the Booking Service to return HTTP 409 Conflict immediately.

### 3. Event-Driven Asynchronous Communication
State-changing operations (such as booking confirmations, cancellations, and ticket generations) publish events asynchronously to Redis Stream `ticketing.events`. Downstream consumer microservices (`analytics-service`, `notification-service`) listen via Redis Consumer Groups (`analytics-group`, `notification-group`) with built-in message acknowledgement (`XACK`) and idempotency protection using `ProcessedEvent`.

### 4. Fault Tolerance & Fallback Strategy
- **Pricing Service Resilience:** If the Pricing Service is unreachable or throws an exception, the Booking Service seamlessly falls back to `event.basePrice` without failing user checkout.
- **Asynchronous Service Isolation:** Analytics or Notification service downtime never affects booking transactions or payment execution.
- **Docker Self-Healing:** Containers use `restart: unless-stopped` with health checks to ensure auto-recovery upon service failures.
