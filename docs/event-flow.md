# Redis Streams Event Flow & Consumer Architecture

## Event Stream Details
- **Stream Name:** `ticketing.events`
- **Broker:** Redis Streams
- **Format:** JSON-encoded key-value entries with unique event ID, event type, producer service ID, ISO-8601 timestamp, and event payload.

---

## Event Lifecycle Matrix

```
[ User Request ]
       │
       ▼
[ Booking Service ]
       │
       ├─► (Publish) USER_REGISTERED / SEAT_LOCKED / BOOKING_CREATED / PAYMENT_SUCCEEDED / BOOKING_CONFIRMED / TICKET_GENERATED
       │
       ▼
 [ Redis Stream: ticketing.events ]
       │
       ├───────────────────────────────────────────┐
       ▼                                           ▼
[ analytics-group ]                        [ notification-group ]
(Analytics Service)                        (Notification Service)
       │                                           │
       ├─ Check ProcessedEvent [Idempotency]       ├─ Check ProcessedEvent [Idempotency]
       ├─ Store Analytics Record                   ├─ Store User Notification
       └─ Send XACK                                └─ Send XACK
```

---

## Event Definitions

### 1. `USER_REGISTERED`
- **Producer:** `auth-service`
- **Payload:** `{ userId, email, role }`

### 2. `SEAT_LOCKED`
- **Producer:** `booking-service`
- **Payload:** `{ eventId, seatId, userId, expiresInSeconds }`

### 3. `BOOKING_CREATED`
- **Producer:** `booking-service`
- **Payload:** `{ bookingId, eventId, userId, totalAmount, seatCount }`

### 4. `PAYMENT_SUCCEEDED`
- **Producer:** `booking-service`
- **Payload:** `{ bookingId, userId, amount }`

### 5. `BOOKING_CONFIRMED`
- **Producer:** `booking-service`
- **Payload:** `{ bookingId, eventId, userId, eventTitle, totalAmount, ticketsCount }`
- **Consumers:** `Analytics Service`, `Notification Service`

### 6. `TICKET_GENERATED`
- **Producer:** `booking-service`
- **Payload:** `{ ticketId, bookingId, userId, eventId, ticketCode }`
- **Consumer:** `Notification Service`

---

## Idempotency Mechanism
Every consumer service maintains a unique table constraint in PostgreSQL on `ProcessedEvent`:
```sql
UNIQUE (eventId, consumer)
```
Before consuming and processing any stream message, the consumer queries `ProcessedEvent`. If a matching record already exists, the event is immediately acknowledged (`XACK`) and skipped.
