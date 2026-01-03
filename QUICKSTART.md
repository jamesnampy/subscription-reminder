# Quick Start Guide

Get your Subscription Reminder app running in 5 minutes!

## Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **pnpm** - Install with: `npm install -g pnpm`
- **PostgreSQL 15+** - Or use Supabase (free)

## Step 1: Install Dependencies

```bash
cd subscription-reminder
pnpm install
```

This installs dependencies for backend, frontend, and all packages.

## Step 2: Set Up Database

### Option A: Supabase (Easiest - Free)

1. Go to [supabase.com](https://supabase.com)
2. Create account and new project
3. Go to Settings > Database > Connection String
4. Copy the "URI" connection string

### Option B: Local PostgreSQL

```bash
createdb subscriptions
```

Your connection string: `postgresql://username:password@localhost:5432/subscriptions`

## Step 3: Configure Backend

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` file:

```env
# Required
DATABASE_URL="your-connection-string-from-step-2"
JWT_SECRET="any-random-string-min-32-chars"
JWT_REFRESH_SECRET="different-random-string-min-32-chars"

# Optional (for notifications)
RESEND_API_KEY=""  # Get free key at resend.com
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

**Generate JWT secrets (Windows PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 4: Run Database Migrations

```bash
cd apps/backend
pnpm prisma migrate dev
```

You should see: ✔ Database migrations complete

## Step 5: Start Backend

```bash
# In apps/backend folder
pnpm dev
```

You should see:
```
[INFO] Database connected successfully
[INFO] Server running on port 5000
[INFO] Starting reminder scheduler
```

## Step 6: Start Frontend

Open a **NEW terminal**:

```bash
cd apps/web
cp .env.example .env   # Creates .env file
pnpm dev
```

Frontend starts at: **http://localhost:5173**

## Step 7: Test It!

1. Open http://localhost:5173
2. Click "Sign up"
3. Create account:
   - Email: test@example.com
   - Password: Test1234
   - First Name: Test
4. Click "Create Account"
5. You're in! Click "Add Subscription"
6. Add your first subscription:
   - Name: Netflix
   - Provider: Netflix
   - Cost: 15.99
   - Billing: Monthly
   - Renewal Date: (pick a future date)
7. Done! 🎉

## Verify Everything Works

### Test Backend

```bash
curl http://localhost:5000/health
```

Expected: `{"status":"ok","timestamp":"..."}`

### Test Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

Expected: User data + access token

## Common Issues

### "Database not connected"

**Fix:**
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Try: `pnpm prisma migrate reset` (WARNING: deletes data)

### "Port 5000 already in use"

**Fix:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### "Module not found"

**Fix:**
```bash
cd subscription-reminder
pnpm install
```

### Frontend shows "Network Error"

**Fix:**
1. Ensure backend is running on port 5000
2. Check `.env` in apps/web has `VITE_API_URL=http://localhost:5000`
3. Restart frontend: `Ctrl+C` then `pnpm dev`

## What's Next?

### Set Up Email Notifications (Optional)

1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Get API key
3. Add to `apps/backend/.env`: `RESEND_API_KEY=re_...`
4. Restart backend
5. Test: Create subscription with renewal in 1-7 days

### Set Up SMS Notifications (Optional)

1. Sign up at [twilio.com](https://twilio.com) (free trial credits)
2. Get phone number and credentials
3. Add to `apps/backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. Restart backend

### Deploy to Production

**Backend (Railway):**
1. Push to GitHub
2. Connect repo at [railway.app](https://railway.app)
3. Set environment variables
4. Deploy!

**Frontend (Vercel):**
1. Push to GitHub
2. Connect repo at [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` to your backend URL
4. Deploy!

## Development Workflow

```bash
# Terminal 1: Backend
cd apps/backend
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev

# Terminal 3: Database GUI (optional)
cd apps/backend
pnpm prisma studio
```

## Need Help?

- **Backend API docs**: `apps/backend/API.md`
- **Test examples**: `apps/backend/TEST_EXAMPLES.md`
- **Frontend docs**: `apps/web/README.md`
- **Setup guide**: `SETUP.md`

## Keyboard Shortcuts

- `Ctrl+C` - Stop running server
- `Ctrl+Shift+R` - Hard refresh browser
- `F12` - Open browser dev tools

## Tips

1. **Database browser**: Use Prisma Studio to view data
   ```bash
   cd apps/backend
   pnpm prisma studio
   # Opens at http://localhost:5555
   ```

2. **Check logs**: Watch terminal for errors

3. **Clear browser cache**: If UI looks broken after updates

4. **Test API**: Use `apps/backend/TEST_EXAMPLES.md` for curl commands

Enjoy your subscription reminder app! 🚀
