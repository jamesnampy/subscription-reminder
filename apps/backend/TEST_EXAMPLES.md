# Backend Testing Guide

This file contains step-by-step examples for testing the Subscription Reminder API.

## Prerequisites

1. Backend server is running on `http://localhost:5000`
2. Database is set up and migrations are run
3. `curl` or similar HTTP client is installed

---

## Test Sequence

Follow these steps in order to test the complete flow.

### 1. Health Check

Verify the server is running:

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-01-03T..."}
```

---

### 2. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    ...
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Save the `accessToken`** - You'll need it for subsequent requests!

---

### 3. Login (Alternative to Register)

If user already exists:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

---

### 4. Get User Profile

Replace `YOUR_TOKEN` with the accessToken from step 2.

```bash
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "test@example.com",
  "firstName": "Test",
  "lastName": "User",
  ...
}
```

---

### 5. Create a Subscription

```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Netflix Premium",
    "provider": "Netflix",
    "category": "Entertainment",
    "cost": 15.99,
    "currency": "USD",
    "billingCycle": "MONTHLY",
    "renewalDate": "2026-02-01T00:00:00Z",
    "reminderDaysBefore": [7, 3, 1]
  }'
```

**Save the subscription `id`** from the response!

---

### 6. Create More Subscriptions

Add variety for testing:

**Spotify:**
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Spotify Premium",
    "provider": "Spotify",
    "category": "Music",
    "cost": 9.99,
    "billingCycle": "MONTHLY",
    "renewalDate": "2026-01-10T00:00:00Z",
    "reminderDaysBefore": [7, 3, 1]
  }'
```

**Adobe Creative Cloud (Yearly):**
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Adobe Creative Cloud",
    "provider": "Adobe",
    "category": "Software",
    "cost": 599.99,
    "billingCycle": "YEARLY",
    "renewalDate": "2026-06-15T00:00:00Z",
    "reminderDaysBefore": [30, 14, 7]
  }'
```

**Gym Membership (Weekly):**
```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Planet Fitness",
    "provider": "Planet Fitness",
    "category": "Health",
    "cost": 24.99,
    "billingCycle": "WEEKLY",
    "renewalDate": "2026-01-08T00:00:00Z"
  }'
```

---

### 7. Get All Subscriptions

```bash
curl http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Filter by status:**
```bash
curl "http://localhost:5000/api/subscriptions?status=ACTIVE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Sort by cost:**
```bash
curl "http://localhost:5000/api/subscriptions?sortBy=cost&order=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 8. Get Upcoming Renewals

Get subscriptions renewing in the next 30 days:

```bash
curl "http://localhost:5000/api/subscriptions/upcoming?days=30" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 9. Get Single Subscription

Replace `SUBSCRIPTION_ID` with an actual ID:

```bash
curl http://localhost:5000/api/subscriptions/SUBSCRIPTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 10. Update a Subscription

Change the renewal date or cost:

```bash
curl -X PATCH http://localhost:5000/api/subscriptions/SUBSCRIPTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cost": 12.99,
    "renewalDate": "2026-03-01T00:00:00Z",
    "reminderDaysBefore": [14, 7, 3, 1]
  }'
```

---

### 11. Mark Subscription as Cancelled

```bash
curl -X POST http://localhost:5000/api/subscriptions/SUBSCRIPTION_ID/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cancellationStatus": "SUCCESSFULLY_CANCELLED",
    "cancellationNotes": "Cancelled via website, received confirmation email"
  }'
```

**Cancellation Status Options:**
- `SUCCESSFULLY_CANCELLED` - You cancelled it
- `FORGOT_TO_CANCEL` - You missed the deadline
- `DECIDED_TO_KEEP` - You're keeping the subscription

---

### 12. Get Notification Preferences

```bash
curl http://localhost:5000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 13. Update Notification Preferences

```bash
curl -X PATCH http://localhost:5000/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "emailEnabled": true,
    "smsEnabled": false,
    "defaultReminderDays": [14, 7, 3, 1],
    "quietHoursStart": 22,
    "quietHoursEnd": 8,
    "timezone": "America/New_York"
  }'
```

---

### 14. Test Email Notification

Send yourself a test welcome email:

```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "EMAIL"
  }'
```

**Note:** Requires `RESEND_API_KEY` to be configured in `.env`

---

### 15. Get Notification History

```bash
curl http://localhost:5000/api/notifications/history \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Limit results:**
```bash
curl "http://localhost:5000/api/notifications/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 16. Get Notification Statistics

```bash
curl http://localhost:5000/api/notifications/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "total": 5,
  "sent": 4,
  "failed": 1,
  "pending": 0,
  "successRate": "80.00"
}
```

---

### 17. Delete a Subscription

```bash
curl -X DELETE http://localhost:5000/api/subscriptions/SUBSCRIPTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:** `204 No Content`

---

### 18. Refresh Access Token

When your access token expires (after 15 minutes):

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Testing Reminders

To test the automated reminder system:

### Option 1: Wait for Scheduled Job

The reminder job runs every hour. Add a subscription with a renewal date that's 7, 3, or 1 days away, then wait.

### Option 2: Manual Trigger (Development Only)

You can add an admin route to manually trigger the reminder job for testing.

**Create a subscription renewing tomorrow:**

```bash
# Calculate tomorrow's date
# On Mac/Linux:
TOMORROW=$(date -d "+1 day" +%Y-%m-%dT00:00:00Z)

# On Windows (PowerShell):
$tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT00:00:00Z")

# Create subscription
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{
    \"name\": \"Test Subscription\",
    \"provider\": \"Test Provider\",
    \"cost\": 9.99,
    \"billingCycle\": \"MONTHLY\",
    \"renewalDate\": \"$TOMORROW\",
    \"reminderDaysBefore\": [1]
  }"
```

This subscription should trigger a reminder on the next scheduler run!

---

## Testing Error Cases

### Invalid Email Format

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Test1234"
  }'
```

**Expected:** `400 Bad Request`

---

### Weak Password

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@example.com",
    "password": "weak"
  }'
```

**Expected:** `400 Bad Request` with password requirements

---

### Unauthorized Access

```bash
curl http://localhost:5000/api/subscriptions
```

**Expected:** `401 Unauthorized`

---

### Invalid Token

```bash
curl http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer invalid_token"
```

**Expected:** `401 Unauthorized`

---

### Subscription Not Found

```bash
curl http://localhost:5000/api/subscriptions/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** `404 Not Found`

---

### Renewal Date in Past

```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Old Subscription",
    "provider": "Test",
    "billingCycle": "MONTHLY",
    "renewalDate": "2020-01-01T00:00:00Z"
  }'
```

**Expected:** `400 Bad Request` - Renewal date must be in the future

---

## Using Postman

If you prefer a GUI, import these examples into Postman:

1. Create a new Collection: "Subscription Reminder API"
2. Add an environment variable: `baseUrl` = `http://localhost:5000`
3. Add an environment variable: `accessToken` (set after login/register)
4. Use `{{baseUrl}}` and `{{accessToken}}` in requests

Example Postman request:
```
POST {{baseUrl}}/api/auth/login
Header: Content-Type: application/json
Body: {"email":"test@example.com","password":"Test1234"}

Test Script:
pm.environment.set("accessToken", pm.response.json().accessToken);
```

---

## Database Inspection

Use Prisma Studio to view data:

```bash
cd apps/backend
pnpm prisma studio
```

Opens at http://localhost:5555

---

## Common Issues

### "Database not connected"

**Solution:** Check DATABASE_URL in `.env` and ensure PostgreSQL is running

### "Module not found"

**Solution:** Run `pnpm install` from project root

### "Prisma Client not generated"

**Solution:** Run `cd apps/backend && pnpm prisma generate`

### No emails being sent

**Solution:** Check `RESEND_API_KEY` in `.env`. Get a free key at resend.com

### Reminders not triggering

**Solution:**
1. Check server logs for scheduler messages
2. Ensure subscription renewal date is 7/3/1 days away
3. Verify subscription status is ACTIVE
4. Check notification preferences are enabled

---

## Load Testing

Test with multiple subscriptions:

```bash
# Create 10 subscriptions
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/subscriptions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d "{
      \"name\": \"Test Subscription $i\",
      \"provider\": \"Provider $i\",
      \"cost\": $(($i * 10)),
      \"billingCycle\": \"MONTHLY\",
      \"renewalDate\": \"2026-0$((i % 9 + 1))-01T00:00:00Z\"
    }" &
done
wait
```

---

## Next Steps

Once basic functionality is working:

1. ✅ Test all CRUD operations
2. ✅ Verify authentication flow
3. ✅ Configure email service (Resend)
4. ✅ Test notification preferences
5. ✅ Verify reminder scheduler works
6. 🚀 Build the frontend
7. 🚀 Create the browser extension
8. 🚀 Deploy to production
