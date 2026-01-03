# Deploy Now - Step by Step

Follow these exact steps to deploy in 15 minutes!

## 🚀 Let's Deploy!

### Step 1: Push to GitHub (5 minutes)

```bash
# Go to your project folder
cd subscription-reminder

# Initialize git
git init
git add .
git commit -m "Ready for deployment"

# Create new GitHub repository
# 1. Go to github.com
# 2. Click "+" in top right
# 3. Click "New repository"
# 4. Name: subscription-reminder
# 5. Click "Create repository"

# Connect and push (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/subscription-reminder.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint**: Refresh GitHub - you should see all your files!

---

### Step 2: Deploy Database (3 minutes)

**Go to [supabase.com](https://supabase.com)**

1. Click "Start your project"
2. Sign up/Login with GitHub
3. Click "New project"
4. Fill in:
   - **Name**: `subscription-reminder`
   - **Database Password**: Click generate (COPY THIS PASSWORD!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2 minutes...
7. Click Settings (gear icon) → Database
8. Scroll to "Connection string"
9. Click "URI"
10. Copy the connection string
11. Replace `[YOUR-PASSWORD]` with the password you copied in step 4

**Save this connection string - you'll need it in Step 3!**

Example:
```
postgresql://postgres.xxx:PASSWORD@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

✅ **Checkpoint**: You have a connection string starting with `postgresql://`

---

### Step 3: Deploy Backend (5 minutes)

**Go to [railway.app](https://railway.app)**

1. Click "Start a New Project"
2. Click "Deploy from GitHub repo"
3. Login with GitHub when prompted
4. Select your `subscription-reminder` repository
5. Click "Deploy Now"
6. Wait 30 seconds for initial setup
7. Click on your service (the purple box)
8. Click "Variables" tab
9. Click "New Variable" and add these **one by one**:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=paste-your-supabase-connection-string-here
JWT_SECRET=your-random-32-character-string
JWT_REFRESH_SECRET=another-random-32-character-string
CORS_ORIGIN=https://subscription-reminder.vercel.app
APP_URL=https://subscription-reminder.vercel.app
```

**To generate JWT secrets (Windows PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Run this twice to get two different secrets.

10. Click "Deploy" (top right)
11. Wait 3-5 minutes for build...
12. Click "Settings" tab
13. Scroll to "Domains"
14. Copy your Railway URL (looks like: `subscription-reminder-production.up.railway.app`)

**SAVE THIS URL!**

✅ **Checkpoint**: Test your backend:
```bash
curl https://your-railway-url.up.railway.app/health
```

Should return: `{"status":"ok","timestamp":"..."}`

---

### Step 4: Deploy Frontend (5 minutes)

**Go to [vercel.com](https://vercel.com)**

1. Click "Add New..." → "Project"
2. Click "Import" next to your `subscription-reminder` repo
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" → Select `apps/web`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

4. Click "Environment Variables"
5. Add variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app` (from Step 3)

6. Click "Deploy"
7. Wait 2-3 minutes...
8. Click "Visit" when ready
9. Copy your Vercel URL (e.g., `subscription-reminder.vercel.app`)

✅ **Checkpoint**: Your app loads but might show connection errors (that's ok for now!)

---

### Step 5: Update Backend CORS (2 minutes)

Now that you have your Vercel URL, update Railway:

1. Go back to [railway.app](https://railway.app)
2. Click on your project
3. Click on your service
4. Click "Variables"
5. Update these two variables:
   - `CORS_ORIGIN`: Change to your Vercel URL: `https://subscription-reminder.vercel.app`
   - `APP_URL`: Change to your Vercel URL: `https://subscription-reminder.vercel.app`

6. Railway will automatically redeploy (wait 2 minutes)

✅ **Checkpoint**: Refresh your Vercel app - it should now work!

---

### Step 6: Test Your Live App! 🎉

1. **Open** your Vercel URL
2. **Click** "Sign up"
3. **Register** a new account:
   - Email: your-email@example.com
   - Password: Test1234
   - First Name: Test
4. **Add** a subscription:
   - Name: Netflix
   - Provider: Netflix
   - Cost: 15.99
   - Billing: Monthly
   - Renewal Date: Pick a date next month
5. **Success!** Your subscription shows up!

---

## 🎊 Congratulations!

Your app is now **LIVE** on the internet!

- **Frontend**: https://subscription-reminder.vercel.app
- **Backend**: https://your-app.up.railway.app

Share it with friends! 🚀

---

## Optional: Add Email Notifications

Want to send actual email reminders? Here's how:

### Get Resend API Key (2 minutes)

1. Go to [resend.com](https://resend.com)
2. Sign up for free
3. Click "API Keys"
4. Click "Create API Key"
5. Name: "Production"
6. Copy the key (starts with `re_`)

### Add to Railway

1. Go to Railway project
2. Click Variables
3. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_key_here`
4. Railway redeploys automatically

### Verify Domain (for production emails)

1. In Resend, click "Domains"
2. Click "Add Domain"
3. Enter your domain
4. Add DNS records (provided by Resend)
5. Wait for verification

**For testing**: Resend works without domain verification, but emails only go to your own email address.

---

## Troubleshooting

### Backend shows "Application error"

**Fix:**
1. Check Railway logs (click on service → Deployments → View logs)
2. Verify all environment variables are set
3. Check DATABASE_URL is correct

### Frontend shows "Network Error"

**Fix:**
1. Check VITE_API_URL is set in Vercel
2. Check CORS_ORIGIN is set in Railway to your Vercel URL
3. Redeploy both services

### Can't register user

**Fix:**
1. Test backend: `curl https://your-backend/health`
2. Check Railway logs for errors
3. Verify database connection

---

## Next Steps

✅ Your app is deployed!

Now you can:
- Add more subscriptions
- Test the reminder system (add subscription renewing in 7 days)
- Set up custom domain
- Add SMS notifications (Twilio)
- Share with friends!

---

## Costs

Everything you just deployed is **FREE**:

- ✅ Supabase: Free tier (500 MB database)
- ✅ Railway: $5 credit/month (renews monthly)
- ✅ Vercel: Free tier (unlimited bandwidth for personal use)
- ✅ Resend: Free tier (100 emails/day)

You won't pay anything until you exceed these limits!

---

## Need Help?

Check the full deployment guide: **DEPLOYMENT.md**

---

**You did it! 🎉 Your app is live on the internet!**
