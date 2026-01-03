# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 20 or higher
- pnpm 8 or higher (`npm install -g pnpm`)
- PostgreSQL 15 or higher

## Step 1: Install Dependencies

From the project root directory:

```bash
cd subscription-reminder
pnpm install
```

This will install all dependencies for the monorepo (backend, frontend, extension, and shared packages).

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL if you haven't already
2. Create a new database:

```bash
createdb subscriptions
```

3. Your DATABASE_URL will be:
```
postgresql://username:password@localhost:5432/subscriptions
```

### Option B: Supabase (Recommended for beginners)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database > Connection String
4. Copy the URI connection string

## Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cd apps/backend
cp .env.example .env
```

2. Edit `.env` and update the following:

```env
# Required for basic functionality
DATABASE_URL="your-postgresql-connection-string"

# Required for auth (generate random strings)
JWT_SECRET="your-random-secret-key-32-chars-minimum"
JWT_REFRESH_SECRET="your-random-refresh-secret-32-chars-minimum"

# Optional for now (needed for notifications later)
RESEND_API_KEY="re_your_api_key"  # Get from resend.com
TWILIO_ACCOUNT_SID="AC..."        # Get from twilio.com
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
```

**Generate secure secrets:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 4: Run Database Migrations

```bash
cd apps/backend
pnpm prisma migrate dev --name init
```

This will:
- Create all database tables
- Generate the Prisma Client
- Set up the schema

## Step 5: Verify Prisma Setup

```bash
cd apps/backend
pnpm prisma studio
```

This opens a browser-based GUI to view your database. You should see empty tables for:
- User
- Subscription
- Notification
- NotificationPreference

## Step 6: Start the Backend Server

```bash
cd apps/backend
pnpm dev
```

The server should start on http://localhost:5000

You should see logs:
```
[INFO] Database connected successfully
[INFO] Server running on port 5000
```

## Step 7: Test the API

### Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-03T..."}
```

### Register a User

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

Expected response:
```json
{
  "user": { "id": "...", "email": "test@example.com", ... },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### Create a Subscription

Save the `accessToken` from the previous step, then:

```bash
curl -X POST http://localhost:5000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "name": "Netflix Premium",
    "provider": "Netflix",
    "category": "Entertainment",
    "cost": 15.99,
    "billingCycle": "MONTHLY",
    "renewalDate": "2026-02-01T00:00:00Z"
  }'
```

### Get All Subscriptions

```bash
curl http://localhost:5000/api/subscriptions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Troubleshooting

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Solution**: Check that PostgreSQL is running and your DATABASE_URL is correct

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change the PORT in `.env` or kill the process using port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Prisma Client Not Generated

```
Error: Cannot find module '@prisma/client'
```

**Solution**:
```bash
cd apps/backend
pnpm prisma generate
```

## Next Steps

Once the backend is running successfully:

1. **Frontend**: Set up the React frontend application
2. **Email Notifications**: Configure Resend for email notifications
3. **SMS Notifications**: Configure Twilio for SMS alerts
4. **Browser Extension**: Build the Chrome extension for auto-detection
5. **Deployment**: Deploy to production (Railway, Vercel, etc.)

## Development Workflow

```bash
# Terminal 1: Backend
cd apps/backend
pnpm dev

# Terminal 2: Frontend (once set up)
cd apps/web
pnpm dev

# Terminal 3: Database GUI (optional)
cd apps/backend
pnpm prisma studio
```

## Useful Commands

```bash
# Install all dependencies
pnpm install

# Run all apps in development
pnpm dev

# Build all apps
pnpm build

# Reset database
cd apps/backend
pnpm prisma migrate reset

# Create a new migration
cd apps/backend
pnpm prisma migrate dev --name migration_name

# View database
cd apps/backend
pnpm prisma studio
```
