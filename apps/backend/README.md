# Subscription Reminder Backend

Node.js + Express + TypeScript + Prisma backend for the Subscription Reminder application.

## Features

✅ **Authentication**
- JWT-based auth with access & refresh tokens
- Password hashing with bcrypt
- Email validation
- User registration and login

✅ **Subscription Management**
- Full CRUD operations
- Flexible billing cycles (daily, weekly, monthly, quarterly, yearly)
- Cancellation tracking (success/forgot/decided to keep)
- Upcoming renewals filtering
- Multi-currency support

✅ **Automated Reminders**
- Scheduled job runs hourly to check for upcoming renewals
- Customizable reminder days (e.g., 7, 3, 1 days before renewal)
- Email notifications via Resend
- SMS notifications via Twilio
- Respects user quiet hours and timezone

✅ **Notification System**
- User notification preferences
- Email and SMS channels
- Notification history and statistics
- Test notification endpoints

✅ **Database**
- PostgreSQL with Prisma ORM
- Type-safe database queries
- Automatic migrations
- Database seeding support

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Email**: Resend
- **SMS**: Twilio
- **Scheduling**: node-cron
- **Validation**: Zod

## Project Structure

```
apps/backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client
│   │   ├── env.ts             # Environment variables
│   │   └── constants.ts       # App constants
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── subscription.controller.ts
│   │   └── notification.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── subscription.routes.ts
│   │   └── notification.routes.ts
│   ├── services/
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   └── notification.service.ts
│   ├── jobs/
│   │   └── reminderJob.ts     # Scheduler
│   ├── utils/
│   │   ├── auth.utils.ts
│   │   ├── dateHelpers.ts
│   │   └── logger.ts
│   └── server.ts              # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Setup

See the main [SETUP.md](../../SETUP.md) guide in the project root for detailed setup instructions.

### Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your settings (DATABASE_URL, JWT secrets, etc.)

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

Server will start on http://localhost:5000

## Environment Variables

Required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/subscriptions"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Optional (for notifications)
RESEND_API_KEY="re_..."           # From resend.com
TWILIO_ACCOUNT_SID="AC..."        # From twilio.com
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
```

## API Documentation

See [API.md](./API.md) for complete API documentation.

### Quick Reference

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/profile` - Get profile

**Subscriptions**
- `GET /api/subscriptions` - List all
- `GET /api/subscriptions/:id` - Get one
- `POST /api/subscriptions` - Create
- `PATCH /api/subscriptions/:id` - Update
- `DELETE /api/subscriptions/:id` - Delete
- `GET /api/subscriptions/upcoming` - Upcoming renewals
- `POST /api/subscriptions/:id/cancel` - Mark as cancelled

**Notifications**
- `GET /api/notifications/preferences` - Get preferences
- `PATCH /api/notifications/preferences` - Update preferences
- `GET /api/notifications/history` - Notification history
- `GET /api/notifications/stats` - Statistics
- `POST /api/notifications/test` - Send test notification

## Testing

See [TEST_EXAMPLES.md](./TEST_EXAMPLES.md) for detailed testing examples.

### Quick Test

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Create subscription (use token from register)
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Netflix",
    "provider": "Netflix",
    "billingCycle": "MONTHLY",
    "cost": 15.99,
    "renewalDate": "2026-02-01T00:00:00Z"
  }'
```

## Database Management

```bash
# Generate Prisma Client
pnpm prisma generate

# Create migration
pnpm prisma migrate dev --name migration_name

# Apply migrations
pnpm prisma migrate deploy

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Open Prisma Studio (GUI)
pnpm prisma studio
```

## Reminder Scheduler

The reminder system runs automatically when the server starts:

- **Schedule**: Every hour (configurable in `CONSTANTS.REMINDER_CHECK_INTERVAL`)
- **Timezone**: UTC
- **Process**:
  1. Finds all active subscriptions with upcoming renewals
  2. Checks if reminder should be sent today (based on `reminderDaysBefore`)
  3. Sends email and/or SMS (based on user preferences)
  4. Respects quiet hours and timezone
  5. Logs all notification attempts

**How it works:**
```typescript
// If renewalDate is Feb 1st and reminderDaysBefore is [7, 3, 1]
// Reminders will be sent on:
// - Jan 25 (7 days before)
// - Jan 29 (3 days before)
// - Jan 31 (1 day before)
```

## Email Service (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to `.env`: `RESEND_API_KEY=re_...`
4. Verify your domain (or use test mode)

**Email Templates:**
- Welcome email (on registration)
- Renewal reminder (7/3/1 days before)
- Cancellation deadline (urgent, 1 day before)

## SMS Service (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Get a phone number
3. Add credentials to `.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. Users need to verify their phone numbers

## Development

```bash
# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check
```

## Logging

All logs use the custom logger in `src/utils/logger.ts`:

```typescript
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.debug('Debug message'); // Only in development
```

Logs include timestamps and log levels.

## Error Handling

All errors are handled by the error middleware:

```typescript
throw new AppError(400, 'Invalid input');
throw new AppError(401, 'Unauthorized');
throw new AppError(404, 'Not found');
```

Unhandled errors return 500 Internal Server Error.

## Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT**: Short-lived access tokens (15 min), long-lived refresh tokens (7 days)
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Validation**: Input validation on all endpoints
- **SQL Injection**: Prevented by Prisma (parameterized queries)

## Performance

- **Database Indexing**: Indexes on userId, renewalDate, status
- **Query Optimization**: Selective field loading
- **Connection Pooling**: Prisma manages connections
- **Logging**: Structured logging for debugging

## Deployment

### Railway / Render / Fly.io

1. Push to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy!

**Build command**: `pnpm install && pnpm prisma generate && pnpm build`

**Start command**: `pnpm start`

### Environment Variables in Production

Make sure to set:
- `DATABASE_URL` (production database)
- `JWT_SECRET` (strong random string)
- `JWT_REFRESH_SECRET` (strong random string)
- `RESEND_API_KEY` (production API key)
- `TWILIO_*` (production credentials)
- `NODE_ENV=production`
- `CORS_ORIGIN` (your frontend URL)

## Troubleshooting

### Server won't start

**Check:**
- PostgreSQL is running
- DATABASE_URL is correct
- All dependencies installed (`pnpm install`)
- Prisma client generated (`pnpm prisma generate`)

### Emails not sending

**Check:**
- RESEND_API_KEY is set
- Email domain is verified in Resend
- Check server logs for errors
- Test with `/api/notifications/test`

### Reminders not working

**Check:**
- Subscription status is ACTIVE
- Renewal date is in the future
- reminderDaysBefore includes today's distance to renewal
- User notification preferences allow emails/SMS
- Check server logs for scheduler messages

### Database errors

**Check:**
- Migrations are up to date (`pnpm prisma migrate deploy`)
- Database schema matches Prisma schema
- Database user has correct permissions

## Contributing

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
