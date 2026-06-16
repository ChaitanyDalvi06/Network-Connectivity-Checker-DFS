# 🚀 Deployment Guide (Render)

## Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (easiest)
3. Link your GitHub account

### Step 2: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`Network-Connectivity-Checker-DFS`** repository
4. Render auto-detects the Dockerfile ✅
5. Click **Deploy**

### Step 3: Configure Environment
In Render dashboard → your service → **Environment** tab:
```
PORT=8080
```

**Your backend URL will be something like:**
```
https://network-connectivity-checker.onrender.com
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
VITE_BACKEND_URL=https://network-connectivity-checker.onrender.com
```

Your frontend URL will be:
```
https://network-connectivity-checker.vercel.app
```

---

## Testing After Deployment

1. ✅ Visit your Vercel URL
2. ✅ Open browser DevTools → Network tab
3. ✅ Draw a graph and click "Run DFS"
4. ✅ Verify the request goes to your Render backend
5. ✅ Check the response

---

## Troubleshooting

### Backend not starting?
- Check Render logs: Dashboard → your service → Logs
- Verify `Dockerfile` exists in root folder
- Ensure Java files are in `/backend` folder

### CORS errors?
- Update backend `Main.java` CORS header with your Vercel URL
- Redeploy after changes

### Connection timeout?
- Check if backend URL is accessible in browser
- Verify PORT environment variable is set in Render

---

## Quick Links
- 🚀 [Render Dashboard](https://dashboard.render.com)
- 🎨 [Vercel Dashboard](https://vercel.app)
- 📖 [Render Deploy Guide](https://render.com/docs)
- 📖 [Vercel Deployment Docs](https://vercel.com/docs)
