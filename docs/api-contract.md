# Online Event Ticketing Platform - API Contract

## Base Gateway URL
`http://localhost:8000`

Swagger UI interactive documentation available at:
`http://localhost:8000/docs`

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "AUDIENCE"
}
```
- **Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "AUDIENCE"
  }
}
```

### 2. Login User
`POST /api/auth/login`
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "AUDIENCE"
  }
}
```

### 3. Get Current User Profile
`GET /api/auth/me`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "AUDIENCE",
    "createdAt": "2026-09-07T10:00:00.000Z"
  }
}
```

### 4. Active Device Sessions
`GET /api/auth/sessions`
- **Headers:** `Authorization: Bearer <access_token>`
- **Response (200 OK):**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "deviceName": "Chrome Web Browser",
      "userAgent": "Mozilla/5.0...",
      "loginTime": "2026-09-07T10:00:00.000Z",
      "lastActive": "2026-09-07T10:05:00.000Z",
      "revoked": false,
      "isCurrent": true
    }
  ]
}
```

### 5. Revoke Device Session
`DELETE /api/auth/sessions/:sessionId`
- **Headers:** `Authorization: Bearer <access_token>`

### 6. Logout Current Device / All Devices
`POST /api/auth/logout`
`POST /api/auth/logout-all`

---

## Event Management Endpoints

### 1. List Events
`GET /api/events?category=CONCERT&city=Boston&search=Symphony`

### 2. Create Event (ORGANIZER / ADMIN)
`POST /api/events`
- **Headers:** `Authorization: Bearer <organizer_token>`
- **Request Body:**
```json
{
  "title": "Grand Symphony Orchestra",
  "description": "Live classical music performance",
  "category": "CONCERT",
  "venue": "Auditorium Main Hall",
  "city": "Boston",
  "date": "2026-10-15T19:00:00.000Z",
  "startTime": "19:00",
  "endTime": "22:00",
  "basePrice": 1200
}
```

### 3. Get Event Seat Map
`GET /api/events/:eventId/seats`
- **Response (200 OK):**
```json
{
  "eventId": "uuid",
  "totalSeats": 50,
  "seats": [
    {
      "id": "uuid",
      "seatNumber": "A1",
      "row": "A",
      "section": "MAIN",
      "status": "AVAILABLE",
      "price": 1200
    }
  ]
}
```

---

## Redis Seat Locking & Booking Endpoints

### 1. Lock Seat (Redis Atomic SET NX EX 300)
`POST /api/bookings/lock`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "eventId": "uuid",
  "seatId": "uuid"
}
```
- **Response (200 OK):**
```json
{
  "message": "Seat locked successfully",
  "lock": {
    "eventId": "uuid",
    "seatId": "uuid",
    "seatNumber": "A1",
    "userId": "uuid",
    "expiresInSeconds": 300
  }
}
```
- **Error Response (409 Conflict):**
```json
{
  "error": {
    "code": "SEAT_UNAVAILABLE",
    "message": "This seat is currently locked or sold."
  }
}
```

### 2. Create Booking
`POST /api/bookings`
- **Request Body:**
```json
{
  "eventId": "uuid",
  "seatIds": ["seat-uuid-1", "seat-uuid-2"]
}
```

### 3. Simulate Payment
`POST /api/payments/:bookingId/simulate`
- **Request Body:**
```json
{
  "success": true
}
```

---

## Dynamic Pricing Endpoint

`GET /api/pricing/:eventId`
- **Response (200 OK):**
```json
{
  "event_id": "uuid",
  "base_price": 1000,
  "current_price": 1250,
  "occupancy_percentage": 84,
  "pricing_factors": ["HIGH_DEMAND"]
}
```

---

## Tickets, Notifications & Analytics

- `GET /api/tickets/my`
- `GET /api/tickets/:ticketId`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `GET /api/analytics/overview`
- `GET /api/analytics/events`
- `GET /api/analytics/revenue`
- `GET /api/health`
