# 🚀 Deployment Guide

## Backend Deployment (Railway)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (easiest)
3. Link your GitHub account

### Step 2: Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`Network-Connectivity-Checker-DFS`** repository
4. Select **`backend`** as the root directory
5. Railway will auto-detect it's a Java project

### Step 3: Configure Environment
Railway automatically detects the `Procfile` and runs your backend.

**Your backend URL will be something like:**
```
https://network-connectivity-backend-production.up.railway.app
```

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Link your repository

### Step 2: Deploy Frontend
1. Click **"New Project"**
2. Import **`Network-Connectivity-Checker-DFS`** repository
3. Framework: Select **Vite**
4. Root Directory: `./frontend`

### Step 3: Add Environment Variables
In Vercel dashboard, go to **Settings → Environment Variables**:
```
VITE_BACKEND_URL=https://network-connectivity-backend-production.up.railway.app
```

Your frontend URL will be:
```
https://your-app-name.vercel.app
```

---

## Update CORS in Backend

Once you have your Vercel URL, update `Main.java` CORS:

```java
exchange.getResponseHeaders().add("Access-Control-Allow-Origin", 
  "https://your-app-name.vercel.app");
```

Or use environment variable for flexibility:
```java
String origin = System.getenv().getOrDefault("FRONTEND_URL", "*");
exchange.getResponseHeaders().add("Access-Control-Allow-Origin", origin);
```

---

## Testing After Deployment

1. ✅ Visit your Vercel URL
2. ✅ Open browser DevTools → Network tab
3. ✅ Draw a graph and click "Run DFS"
4. ✅ Verify the request goes to your Railway URL
5. ✅ Check the response

---

## Troubleshooting

### Backend not starting?
- Check Railway logs: Dashboard → your project → Deployments
- Ensure `Procfile` exists in `/backend/` folder
- Verify `*.java` files compile locally first

### CORS errors?
- Update `FRONTEND_URL` in Railway environment variables
- Redeploy after changes

### Connection timeout?
- Check if backend URL is accessible in browser
- Verify port is set correctly (Railway uses `PORT` env var)

---

## Quick Links
- 🚀 [Railway Dashboard](https://railway.app)
- 🎨 [Vercel Dashboard](https://vercel.app)
- 📖 [Railway Java Docs](https://docs.railway.app/guides/java)
- 📖 [Vercel Deployment Docs](https://vercel.com/docs)
