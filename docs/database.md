# Database Schema & Logical Service Ownership

## Storage Engine
- **Database:** PostgreSQL 15+
- **ORM:** Prisma ORM

## Logical Service Schema Ownership

| Microservice | Owned Tables / Entities | Responsibilities |
| :--- | :--- | :--- |
| **Auth Service** | `User`, `UserSession` | User profiles, password hashes, multi-device active sessions |
| **Event Service** | `Event`, `Seat` | Event metadata, category, capacity, seat maps |
| **Booking Service** | `Booking`, `BookingSeat`, `Ticket` | Booking state machine, seat assignments, QR ticket codes |
| **Pricing Service** | `PricingRule` | Dynamic pricing rules & thresholds |
| **Notification Service** | `Notification` | User notification inbox & read statuses |
| **Analytics Service** | `AnalyticsEvent`, `ProcessedEvent` | Aggregated events history & stream idempotency tracking |

---

## Entity Descriptions & Key Constraints

### `User`
- Primary key `id` (UUID).
- Unique index on `email`.
- Enums for `Role` (`AUDIENCE`, `ORGANIZER`, `ADMIN`).

### `UserSession`
- Tracks multi-device sessions independently.
- References `User` with Cascade Delete.
- Contains `deviceName`, `userAgent`, `loginTime`, `lastActive`, `revoked`.

### `Event`
- Owned by an `ORGANIZER`.
- Tracks `ticketsSold`, `totalCapacity`, `basePrice`, `status`.

### `Seat`
- Composite unique key: `@@unique([eventId, seatNumber])`.
- Statuses: `AVAILABLE`, `LOCKED`, `SOLD`.

### `Booking`
- Statuses: `PENDING_PAYMENT`, `PAYMENT_PROCESSING`, `CONFIRMED`, `FAILED`, `CANCELLED`.

### `Ticket`
- Unique `ticketCode`. Stores Base64 QR code data URL.
- Statuses: `VALID`, `USED`, `CANCELLED`.

### `ProcessedEvent`
- Composite unique constraint: `@@unique([eventId, consumer])`. Prevents duplicate processing across Redis Streams workers.
