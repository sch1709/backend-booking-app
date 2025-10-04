# Railway Deployment Guide

## Steps to Deploy on Railway

### 1. Fix the Issues (Already Done)
- ✅ Updated server to bind to `0.0.0.0` for containerized environments
- ✅ Fixed CORS configuration for production
- ✅ Added health check endpoints
- ✅ Created Railway configuration files

### 2. Railway Environment Variables
In your Railway dashboard, set these environment variables:

**Required:**
- `NODE_ENV=production`
- `PORT` (Railway will set this automatically)
- `SUPABASE_URL=https://sqtunhniapebaxvozacy.supabase.co`
- `SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxdHVuaG5pYXBlYmF4dm96YWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDI3NzksImV4cCI6MjA2OTgxODc3OX0.Hwts5VpKzGE0imv6adT8zUwz1I0WjSH2G2M8rx2B-nw`

**Important - Change this JWT Secret:**
- `JWT_SECRET=` (Generate a new, secure secret for production!)

**Optional:**
- `FRONTEND_URL=` (Your frontend domain if you have CORS restrictions)

### 3. Generate a Secure JWT Secret
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Deploy Steps
1. Push your changes to GitHub
2. In Railway dashboard:
   - Connect your GitHub repository
   - Set the environment variables above
   - Deploy the service
3. Railway will provide you a URL like: `https://your-app-name.railway.app`

### 5. Test Your Deployment
After deployment, test these endpoints:
- `https://your-app-name.railway.app/` - Should show API status
- `https://your-app-name.railway.app/health` - Health check
- `https://your-app-name.railway.app/api/` - Your API routes

### 6. Common Issues and Solutions

**Can't access the site:**
- Check Railway logs for errors
- Ensure environment variables are set correctly
- Verify the health check endpoint works

**CORS errors:**
- Add your frontend domain to `FRONTEND_URL` environment variable
- Check the CORS configuration in the logs

**Database connection issues:**
- Verify Supabase credentials are correct
- Check if Supabase allows connections from Railway's IP ranges

**Port issues:**
- Railway automatically sets the PORT variable, don't override it
- The app should bind to `0.0.0.0` (already fixed)

### 7. Security Reminders
- ⚠️ Change the JWT_SECRET to a secure random string
- ⚠️ Don't commit the .env file to version control (add to .gitignore)
- ⚠️ Set NODE_ENV=production in Railway

## Debugging Commands
If you need to debug locally with production-like settings:
```bash
# Set environment to production locally
$env:NODE_ENV="production"; npm start
```