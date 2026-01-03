# Deployment Guide

Deploy your Subscription Reminder app to production in 10-15 minutes!

## Overview

We'll deploy:
- **Backend** → Railway (or Render as alternative)
- **Frontend** → Vercel
- **Database** → Supabase (or Railway PostgreSQL)

All platforms have generous free tiers!

---

## Option A: Railway + Vercel (Recommended)

### Step 1: Prepare Your Code

```bash
# Initialize git if you haven't already
cd subscription-reminder
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
# Go to github.com and create new repository
git remote add origin https://github.com/YOUR_USERNAME/subscription-reminder.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Database (Supabase)

1. **Go to** [supabase.com](https://supabase.com)
2. **Click** "Start your project"
3. **Create** new organization (free)
4. **Create** new project:
   - Name: `subscription-reminder`
   - Database Password: (generate strong password - SAVE IT!)
   - Region: Choose closest to you
5. **Wait** ~2 minutes for setup
6. **Go to** Settings → Database → Connection string
7. **Copy** the "URI" connection string (looks like `postgresql://postgres...`)
8. **Replace** `[YOUR-PASSWORD]` with your actual password
9. **Save this** - you'll need it in Step 3!

### Step 3: Deploy Backend (Railway)

1. **Go to** [railway.app](https://railway.app)
2. **Click** "Start a New Project"
3. **Login** with GitHub
4. **Click** "Deploy from GitHub repo"
5. **Select** your `subscription-reminder` repository
6. **Click** "Add variables"
7. **Add these environment variables**:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-supabase-connection-string-from-step-2
JWT_SECRET=generate-random-32-char-string
JWT_REFRESH_SECRET=generate-different-random-32-char-string
CORS_ORIGIN=https://your-app-name.vercel.app
APP_URL=https://your-app-name.vercel.app

# Optional - for notifications
RESEND_API_KEY=re_your_key_here
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

**Generate secrets:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

8. **Click** "Deploy"
9. **Wait** 3-5 minutes for build
10. **Copy** your Railway URL (looks like `https://subscription-reminder-production.up.railway.app`)
11. **Save this** - you'll need it for frontend!

**Verify it works:**
```bash
curl https://your-railway-url.up.railway.app/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Step 4: Run Database Migrations

Railway will automatically run migrations on deploy. If you need to run manually:

1. **Go to** Railway project
2. **Click** on your service
3. **Go to** Settings → Deploy → Deploy Trigger
4. **Or** use Railway CLI:

```bash
npm install -g @railway/cli
railway login
railway link
railway run pnpm prisma migrate deploy
```

### Step 5: Deploy Frontend (Vercel)

1. **Go to** [vercel.com](https://vercel.com)
2. **Click** "Add New..." → "Project"
3. **Import** your GitHub repository
4. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `apps/web`
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

5. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   ```

6. **Click** "Deploy"
7. **Wait** 2-3 minutes
8. **Your app is live!** 🎉

**Get your URL:** https://subscription-reminder.vercel.app

### Step 6: Update Backend CORS

Now that you have your Vercel URL:

1. **Go back** to Railway
2. **Click** on your backend service
3. **Go to** Variables
4. **Update** `CORS_ORIGIN` and `APP_URL` to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   APP_URL=https://your-app.vercel.app
   ```
5. **Save** - Railway will redeploy automatically

### Step 7: Test Your Production App!

1. **Open** your Vercel URL
2. **Register** a new account
3. **Add** a subscription
4. **Success!** 🚀

---

## Option B: Render (Alternative)

### Deploy to Render (All-in-One)

1. **Go to** [render.com](https://render.com)
2. **Sign up** with GitHub
3. **Click** "New +" → "Blueprint"
4. **Connect** your repository
5. **Render** will read `render.yaml` and set up:
   - PostgreSQL database
   - Backend service
6. **Set additional environment variables**:
   ```
   RESEND_API_KEY=re_...
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   ```
7. **Deploy!**

Then deploy frontend to Vercel (same as Step 5 above).

---

## Environment Variables Reference

### Backend (Railway/Render)

| Variable | Required | Example | Where to Get |
|----------|----------|---------|--------------|
| `NODE_ENV` | Yes | `production` | Set manually |
| `PORT` | Yes | `5000` | Set manually |
| `DATABASE_URL` | Yes | `postgresql://...` | Supabase/Railway |
| `JWT_SECRET` | Yes | Random 32+ chars | Generate yourself |
| `JWT_REFRESH_SECRET` | Yes | Random 32+ chars | Generate yourself |
| `CORS_ORIGIN` | Yes | `https://yourapp.vercel.app` | Your Vercel URL |
| `APP_URL` | Yes | `https://yourapp.vercel.app` | Your Vercel URL |
| `RESEND_API_KEY` | Optional | `re_...` | resend.com |
| `TWILIO_ACCOUNT_SID` | Optional | `AC...` | twilio.com |
| `TWILIO_AUTH_TOKEN` | Optional | `...` | twilio.com |
| `TWILIO_PHONE_NUMBER` | Optional | `+1234567890` | twilio.com |

### Frontend (Vercel)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_URL` | Yes | `https://your-backend.up.railway.app` |

---

## Custom Domain (Optional)

### Add Custom Domain to Vercel

1. **Go to** Vercel project
2. **Click** Settings → Domains
3. **Add** your domain (e.g., `myapp.com`)
4. **Follow** DNS setup instructions
5. **Update** Railway variables:
   ```
   CORS_ORIGIN=https://myapp.com
   APP_URL=https://myapp.com
   ```

### Add Custom Domain to Railway

1. **Go to** Railway project
2. **Click** Settings → Domains
3. **Add** custom domain
4. **Update** Vercel:
   ```
   VITE_API_URL=https://api.myapp.com
   ```

---

## Post-Deployment Checklist

### ✅ Verify Backend

```bash
# Health check
curl https://your-backend-url/health

# Register test user
curl -X POST https://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

### ✅ Verify Frontend

1. Open your Vercel URL
2. Register new account
3. Add a subscription
4. Check dashboard loads
5. Verify stats calculate correctly

### ✅ Verify Scheduler

1. Check Railway logs for: `Starting reminder scheduler`
2. Add subscription with renewal in 7 days
3. Wait ~1 hour
4. Check logs for: `Processing reminder for...`

### ✅ Verify Notifications (if configured)

1. Ensure `RESEND_API_KEY` is set
2. Add subscription renewing tomorrow
3. Wait for next hour
4. Check email for reminder

---

## Monitoring & Logs

### Railway Logs

1. **Go to** Railway project
2. **Click** on service
3. **View** Deployments → Click latest
4. **See** live logs

**Watch for:**
- `[INFO] Server running on port 5000`
- `[INFO] Database connected successfully`
- `[INFO] Starting reminder scheduler`

### Vercel Logs

1. **Go to** Vercel project
2. **Click** Deployments → Click latest
3. **View** Function Logs

### Database Monitoring

**Supabase:**
1. Go to Database → Logs
2. Monitor queries and errors

**Railway:**
1. Click on database service
2. View Metrics

---

## Scaling & Performance

### Backend Scaling (Railway)

Free tier limits:
- 500 hours/month
- $5 credit/month
- 512 MB RAM
- 1 GB disk

**Upgrade when needed:**
- Settings → Plan → Upgrade to Pro ($5/month base)
- Automatic scaling based on usage

### Database Scaling (Supabase)

Free tier:
- 500 MB database
- Unlimited API requests
- 2 GB bandwidth

**Upgrade when needed:**
- Pro plan: $25/month (8 GB database)

### Frontend Scaling (Vercel)

Free tier:
- 100 GB bandwidth
- Unlimited requests
- Global CDN

**Upgrade when needed:**
- Pro plan: $20/month (1 TB bandwidth)

---

## Troubleshooting

### Backend won't deploy

**Check:**
- Build logs in Railway/Render
- All required env vars are set
- DATABASE_URL is correct
- Node version compatible (20+)

**Fix:**
```bash
# Test build locally first
cd apps/backend
pnpm install
pnpm prisma generate
pnpm build
```

### Frontend can't connect to backend

**Check:**
- `VITE_API_URL` is set correctly
- Backend is running (check /health)
- CORS_ORIGIN matches frontend URL
- No typos in URLs

**Fix:**
1. Verify in browser console (F12)
2. Check Network tab for 404/CORS errors
3. Update environment variables
4. Redeploy

### Database connection errors

**Check:**
- DATABASE_URL format: `postgresql://user:pass@host:5432/dbname`
- Password special characters are URL-encoded
- Database is running
- Firewall allows connections

**Fix:**
1. Test connection locally
2. Check Supabase/Railway dashboard
3. Regenerate connection string

### Scheduler not running

**Check Railway logs for:**
```
[INFO] Starting reminder scheduler
[INFO] Scheduler will run: 0 * * * *
```

**If missing:**
1. Check server.ts imports reminderJob
2. Verify NODE_ENV=production
3. Restart service

### Emails not sending

**Check:**
- RESEND_API_KEY is set
- Domain is verified in Resend
- Check Resend dashboard for failures
- Logs show "Email sent successfully"

**Fix:**
1. Test API key locally
2. Check Resend limits (100/day free)
3. Verify sender domain

---

## Maintenance

### Update Code

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Automatic deployment:
# - Railway: Auto-deploys from main branch
# - Vercel: Auto-deploys from main branch
```

### Database Migrations

```bash
# Create new migration locally
cd apps/backend
pnpm prisma migrate dev --name add_new_field

# Push to GitHub
git add .
git commit -m "Add database migration"
git push

# Railway automatically runs: pnpm prisma migrate deploy
```

### Rollback Deployment

**Railway:**
1. Go to Deployments
2. Click on previous deployment
3. Click "Redeploy"

**Vercel:**
1. Go to Deployments
2. Click on previous deployment
3. Click "Promote to Production"

---

## Security Best Practices

### ✅ Must Do

1. **Use strong JWT secrets** (32+ random characters)
2. **Enable HTTPS only** (automatic on Railway/Vercel)
3. **Set CORS_ORIGIN** to exact frontend URL
4. **Keep dependencies updated**: `pnpm update`
5. **Monitor logs** for suspicious activity
6. **Use environment variables** (never commit secrets)

### ✅ Recommended

1. **Enable 2FA** on Railway/Vercel/GitHub
2. **Set up monitoring** (Sentry, LogRocket)
3. **Add rate limiting** (already in backend)
4. **Regular backups** (Supabase auto-backup)
5. **Security headers** (already using Helmet.js)

---

## Costs Summary

### Free Tier (Good for 100-1000 users)

- **Supabase**: Free (500 MB database)
- **Railway**: Free ($5 credit/month)
- **Vercel**: Free (100 GB bandwidth)
- **Resend**: Free (100 emails/day)
- **Twilio**: Trial credits (~$15)

**Total: $0/month** for first few months!

### Paid Tier (1000+ users)

- **Supabase Pro**: $25/month
- **Railway Pro**: $5/month + usage
- **Vercel Pro**: $20/month
- **Resend**: $20/month (50K emails)
- **Twilio**: ~$0.0075/SMS

**Estimated: $50-70/month** for 1000+ active users

---

## Success! 🎉

Your app is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.up.railway.app

Share it with friends and start tracking subscriptions!

## What's Next?

- ✅ Add more subscriptions
- ✅ Test email/SMS notifications
- ✅ Set up custom domain
- ✅ Monitor usage and scale as needed
- 🚀 Build the browser extension next!
