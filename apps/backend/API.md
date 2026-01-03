# Subscription Reminder API Documentation

Base URL: `http://localhost:5000`

## Table of Contents
- [Authentication](#authentication)
- [Subscriptions](#subscriptions)
- [Notifications](#notifications)
- [Error Responses](#error-responses)

---

## Authentication

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "phoneVerified": false,
    "createdAt": "2026-01-03T...",
    "updatedAt": "2026-01-03T..."
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:**
- `400` - Missing required fields or invalid email/password
- `409` - User already exists

---

### Login

Authenticate an existing user.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "phoneVerified": false,
    "createdAt": "2026-01-03T...",
    "updatedAt": "2026-01-03T..."
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials

---

### Refresh Token

Get a new access token using a refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

---

### Get Profile

Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": null,
  "emailVerified": false,
  "phoneVerified": false,
  "createdAt": "2026-01-03T...",
  "updatedAt": "2026-01-03T..."
}
```

---

## Subscriptions

All subscription endpoints require authentication via `Authorization: Bearer <token>` header.

### Get All Subscriptions

**Endpoint:** `GET /api/subscriptions`

**Query Parameters:**
- `status` (optional): Filter by status (`ACTIVE`, `CANCELLED`, `PAUSED`, `EXPIRED`)
- `sortBy` (optional): Sort field (default: `renewalDate`)
- `order` (optional): Sort order (`asc` or `desc`, default: `asc`)

**Response:** `200 OK`
```json
{
  "subscriptions": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "Netflix Premium",
      "provider": "Netflix",
      "category": "Entertainment",
      "cost": "15.99",
      "currency": "USD",
      "billingCycle": "MONTHLY",
      "startDate": null,
      "renewalDate": "2026-02-01T00:00:00.000Z",
      "lastReminderSent": null,
      "status": "ACTIVE",
      "cancellationStatus": "NOT_ATTEMPTED",
      "cancelledAt": null,
      "cancellationNotes": null,
      "detectionMethod": "MANUAL_ENTRY",
      "detectionSource": null,
      "reminderDaysBefore": [7, 3, 1],
      "createdAt": "2026-01-03T...",
      "updatedAt": "2026-01-03T...",
      "_count": {
        "notifications": 0
      }
    }
  ],
  "total": 1
}
```

---

### Get Single Subscription

**Endpoint:** `GET /api/subscriptions/:id`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Netflix Premium",
  "provider": "Netflix",
  "category": "Entertainment",
  "cost": "15.99",
  "currency": "USD",
  "billingCycle": "MONTHLY",
  "renewalDate": "2026-02-01T00:00:00.000Z",
  "status": "ACTIVE",
  "cancellationStatus": "NOT_ATTEMPTED",
  "reminderDaysBefore": [7, 3, 1],
  "notifications": [
    {
      "id": "uuid",
      "type": "RENEWAL_REMINDER",
      "channel": "EMAIL",
      "status": "SENT",
      "sentAt": "2026-01-03T...",
      "createdAt": "2026-01-03T..."
    }
  ]
}
```

---

### Create Subscription

**Endpoint:** `POST /api/subscriptions`

**Request Body:**
```json
{
  "name": "Netflix Premium",
  "provider": "Netflix",
  "category": "Entertainment",
  "cost": 15.99,
  "currency": "USD",
  "billingCycle": "MONTHLY",
  "renewalDate": "2026-02-01T00:00:00Z",
  "reminderDaysBefore": [7, 3, 1],
  "startDate": "2026-01-01T00:00:00Z"
}
```

**Required Fields:**
- `name` - Subscription name
- `provider` - Service provider
- `billingCycle` - One of: `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`
- `renewalDate` - Must be in the future

**Optional Fields:**
- `category` - Subscription category
- `cost` - Amount (number)
- `currency` - ISO currency code (default: USD)
- `startDate` - When subscription started
- `reminderDaysBefore` - Array of days (default: [7, 3, 1])
- `detectionMethod` - How it was added (default: MANUAL_ENTRY)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Netflix Premium",
  "provider": "Netflix",
  ...
}
```

---

### Update Subscription

**Endpoint:** `PATCH /api/subscriptions/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Netflix Basic",
  "cost": 9.99,
  "renewalDate": "2026-03-01T00:00:00Z",
  "status": "ACTIVE",
  "reminderDaysBefore": [14, 7, 3, 1]
}
```

**Response:** `200 OK`

---

### Delete Subscription

**Endpoint:** `DELETE /api/subscriptions/:id`

**Response:** `204 No Content`

---

### Get Upcoming Renewals

Get subscriptions renewing within a specified number of days.

**Endpoint:** `GET /api/subscriptions/upcoming`

**Query Parameters:**
- `days` (optional): Number of days to look ahead (default: 30)

**Response:** `200 OK`
```json
{
  "subscriptions": [...],
  "total": 5
}
```

---

### Mark as Cancelled

Track cancellation status for a subscription.

**Endpoint:** `POST /api/subscriptions/:id/cancel`

**Request Body:**
```json
{
  "cancellationStatus": "SUCCESSFULLY_CANCELLED",
  "cancellationNotes": "Cancelled via website, confirmation email received"
}
```

**Cancellation Status Options:**
- `NOT_ATTEMPTED` - Haven't tried to cancel yet
- `REMINDED` - Received reminder to cancel
- `SUCCESSFULLY_CANCELLED` - Successfully cancelled
- `FORGOT_TO_CANCEL` - Forgot to cancel before renewal
- `DECIDED_TO_KEEP` - Decided to continue subscription

**Response:** `200 OK`

---

## Notifications

### Get Notification Preferences

**Endpoint:** `GET /api/notifications/preferences`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "emailEnabled": true,
  "smsEnabled": false,
  "defaultReminderDays": [7, 3, 1],
  "quietHoursStart": 22,
  "quietHoursEnd": 8,
  "timezone": "America/New_York",
  "createdAt": "2026-01-03T...",
  "updatedAt": "2026-01-03T..."
}
```

---

### Update Notification Preferences

**Endpoint:** `PATCH /api/notifications/preferences`

**Request Body:** (all fields optional)
```json
{
  "emailEnabled": true,
  "smsEnabled": true,
  "defaultReminderDays": [14, 7, 3, 1],
  "quietHoursStart": 22,
  "quietHoursEnd": 8,
  "timezone": "America/Los_Angeles"
}
```

**Field Descriptions:**
- `emailEnabled` - Enable email notifications
- `smsEnabled` - Enable SMS notifications
- `defaultReminderDays` - Default reminder schedule for new subscriptions
- `quietHoursStart` - Hour (0-23) when quiet hours start
- `quietHoursEnd` - Hour (0-23) when quiet hours end
- `timezone` - IANA timezone (e.g., "America/New_York", "Europe/London")

**Response:** `200 OK`

---

### Get Notification History

**Endpoint:** `GET /api/notifications/history`

**Query Parameters:**
- `limit` (optional): Number of notifications to return (default: 50)

**Response:** `200 OK`
```json
{
  "notifications": [
    {
      "id": "uuid",
      "subscriptionId": "uuid",
      "type": "RENEWAL_REMINDER",
      "channel": "EMAIL",
      "status": "SENT",
      "scheduledFor": "2026-01-03T10:00:00.000Z",
      "sentAt": "2026-01-03T10:00:05.000Z",
      "failedAt": null,
      "errorMessage": null,
      "createdAt": "2026-01-03T10:00:00.000Z",
      "subscription": {
        "name": "Netflix Premium",
        "provider": "Netflix"
      }
    }
  ],
  "total": 1
}
```

---

### Get Notification Statistics

**Endpoint:** `GET /api/notifications/stats`

**Response:** `200 OK`
```json
{
  "total": 42,
  "sent": 40,
  "failed": 2,
  "pending": 0,
  "successRate": "95.24"
}
```

---

### Test Notification

Send a test notification to verify configuration.

**Endpoint:** `POST /api/notifications/test`

**Request Body:**
```json
{
  "channel": "EMAIL"
}
```

**Channel Options:**
- `EMAIL` - Send test email
- `SMS` - Send test SMS (requires verified phone)

**Response:** `200 OK`
```json
{
  "message": "Test email sent"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

---

## Authentication Flow

1. **Register** or **Login** to get tokens
2. Use `accessToken` in `Authorization: Bearer <token>` header for all protected endpoints
3. When `accessToken` expires (15 minutes), use `refreshToken` to get a new one
4. Store tokens securely (httpOnly cookies recommended for production)

---

## Reminder System

### How Reminders Work

1. When you create a subscription, specify `reminderDaysBefore` (e.g., `[7, 3, 1]`)
2. The system checks every hour for subscriptions needing reminders
3. If today is 7, 3, or 1 days before renewal, a reminder is sent
4. Reminders are sent via:
   - **Email** (if `emailEnabled` is true)
   - **SMS** (if `smsEnabled` is true AND phone is verified)
5. Reminders respect quiet hours based on user timezone

### Cancellation Tracking

Track whether you actually cancelled:

1. Receive reminder → status becomes `REMINDED`
2. Cancel subscription → mark as `SUCCESSFULLY_CANCELLED`
3. Forgot to cancel → mark as `FORGOT_TO_CANCEL`
4. Decided to keep → mark as `DECIDED_TO_KEEP`

This helps you see which subscriptions you successfully cancelled vs. forgot about.

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Headers**: Check `X-RateLimit-*` headers for current limits

---

## Best Practices

1. **Always validate dates** - Ensure `renewalDate` is in the future
2. **Use refresh tokens** - Don't ask users to re-login every 15 minutes
3. **Handle errors gracefully** - Check response status codes
4. **Set timezone** - Use user's actual timezone for accurate reminders
5. **Test notifications** - Use `/api/notifications/test` before relying on them
6. **Update preferences** - Let users configure quiet hours and notification channels

---

## Example Workflows

### Adding a New Subscription

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'

# Save the accessToken from response

# 2. Create subscription
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Spotify Premium",
    "provider": "Spotify",
    "category": "Entertainment",
    "cost": 9.99,
    "billingCycle": "MONTHLY",
    "renewalDate": "2026-02-15T00:00:00Z",
    "reminderDaysBefore": [7, 3, 1]
  }'
```

### Configuring Notifications

```bash
# Update notification preferences
curl -X PATCH http://localhost:5000/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "emailEnabled": true,
    "smsEnabled": true,
    "defaultReminderDays": [14, 7, 3, 1],
    "quietHoursStart": 22,
    "quietHoursEnd": 8,
    "timezone": "America/New_York"
  }'

# Test email notification
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"channel":"EMAIL"}'
```

---

## Webhooks (Future Feature)

Coming soon: Webhook support for external integrations.
