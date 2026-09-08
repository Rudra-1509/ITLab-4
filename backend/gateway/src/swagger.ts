export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Online Event Ticketing Platform API',
    version: '1.0.0',
    description: 'Production-grade microservices REST API for University Event Ticketing Platform with Redis seat locking, Redis Streams, and Dynamic Pricing.'
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'API Gateway'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        summary: 'System health check across all microservices, Redis & PostgreSQL',
        responses: {
          '200': { description: 'Health status report' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', example: 'password123' },
                  role: { type: 'string', enum: ['AUDIENCE', 'ORGANIZER', 'ADMIN'], example: 'AUDIENCE' }
                },
                required: ['name', 'email', 'password']
              }
            }
          }
        },
        responses: {
          '201': { description: 'User registered successfully' },
          '409': { description: 'User already exists' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user & establish session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'password123' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          '200': { description: 'JWT token and user info' },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Authenticated user profile' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/auth/sessions': {
      get: {
        summary: 'View active physical device sessions',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of sessions' }
        }
      }
    },
    '/api/auth/sessions/{sessionId}': {
      delete: {
        summary: 'Revoke a specific session',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Session revoked' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout current device session',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Logged out' }
        }
      }
    },
    '/api/auth/logout-all': {
      post: {
        summary: 'Logout all device sessions',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'All sessions revoked' }
        }
      }
    },
    '/api/events': {
      get: {
        summary: 'Browse events with optional filters',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'List of events' }
        }
      },
      post: {
        summary: 'Create a new event (ORGANIZER / ADMIN)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Grand Symphony Concert' },
                  description: { type: 'string', example: 'Live classical music performance' },
                  category: { type: 'string', enum: ['CONCERT', 'THEATER', 'SPORTS'], example: 'CONCERT' },
                  venue: { type: 'string', example: 'University Auditorium' },
                  city: { type: 'string', example: 'Boston' },
                  date: { type: 'string', example: '2026-10-15T19:00:00.000Z' },
                  startTime: { type: 'string', example: '19:00' },
                  endTime: { type: 'string', example: '22:00' },
                  basePrice: { type: 'number', example: 1000 }
                },
                required: ['title', 'description', 'category', 'venue', 'city', 'date', 'startTime', 'endTime', 'basePrice']
              }
            }
          }
        },
        responses: {
          '201': { description: 'Event created and seats generated' }
        }
      }
    },
    '/api/events/{eventId}': {
      get: {
        summary: 'Get details for a specific event',
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Event details' }
        }
      }
    },
    '/api/events/{eventId}/seats': {
      get: {
        summary: 'Get seat map and live availability (including Redis locks)',
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Seats map' }
        }
      }
    },
    '/api/pricing/{eventId}': {
      get: {
        summary: 'Get dynamic ticket pricing for an event',
        parameters: [
          { name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Calculated dynamic price breakdown' }
        }
      }
    },
    '/api/bookings/lock': {
      post: {
        summary: 'Temporarily lock a seat in Redis (NX EX 300)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  eventId: { type: 'string' },
                  seatId: { type: 'string' }
                },
                required: ['eventId', 'seatId']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Seat locked for 5 minutes' },
          '409': { description: 'Seat unavailable or already locked' }
        }
      }
    },
    '/api/bookings/unlock': {
      post: {
        summary: 'Immediately unlock a seat in Redis',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  eventId: { type: 'string' },
                  seatId: { type: 'string' }
                },
                required: ['eventId', 'seatId']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Seat unlocked successfully' },
          '403': { description: 'Forbidden - Lock not held by user' }
        }
      }
    },
    '/api/bookings': {
      post: {
        summary: 'Create pending booking from locked seats',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  eventId: { type: 'string' },
                  seatIds: { type: 'array', items: { type: 'string' } }
                },
                required: ['eventId', 'seatIds']
              }
            }
          }
        },
        responses: {
          '201': { description: 'Pending booking created' }
        }
      }
    },
    '/api/payments/{bookingId}/simulate': {
      post: {
        summary: 'Simulate payment result (Success or Failure)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'bookingId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true }
                },
                required: ['success']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Payment simulated, ticket generated if success' }
        }
      }
    },
    '/api/tickets/my': {
      get: {
        summary: 'View authenticated user tickets with QR codes',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of valid/used tickets' }
        }
      }
    },
    '/api/notifications': {
      get: {
        summary: 'View user notifications',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'List of notifications' }
        }
      }
    },
    '/api/analytics/overview': {
      get: {
        summary: 'Platform / Event analytics overview (ORGANIZER / ADMIN)',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': { description: 'Analytics overview' }
        }
      }
    }
  }
};
