# Deployment Guide for Harvard Macros

This guide will help you deploy the Harvard Macros application to production.

## Architecture

- **Frontend**: React + Vite (hosted on Netlify)
- **Backend**: Node.js + Express (hosted on Render or Railway)

---

## Step 1: Deploy Backend (Render - FREE)

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Deploy on Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `harvardmacros-api` (or your choice)
   - **Root Directory**: Leave empty (or put `server` if you want)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free
5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Copy your backend URL** (e.g., `https://harvardmacros-api.onrender.com`)

### Important Notes for Render:
- Free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid tier ($7/month) for always-on service

---

## Step 2: Deploy Frontend (Netlify - FREE)

### 2.1 Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Configure:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Add Environment Variable**:
   - Click **"Add environment variables"**
   - Key: `VITE_API_URL`
   - Value: Your Render backend URL (e.g., `https://harvardmacros-api.onrender.com`)
6. Click **"Deploy site"**
7. Wait for deployment (2-5 minutes)
8. Your site is live! (e.g., `https://your-site-name.netlify.app`)

### 2.2 Custom Domain (Optional)
1. In Netlify dashboard, go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Follow instructions to connect your domain

---

## Alternative: Railway (Backend)

Railway is another great option for backend hosting:

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Click on your service → **"Settings"** → **"Generate Domain"**
7. Copy the domain and use it as `VITE_API_URL` in Netlify

---

## Step 3: Update Backend for Production

The backend needs to allow requests from your Netlify domain.

### 3.1 Update CORS in `server/index.js`

Find the CORS configuration and update it:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://your-site-name.netlify.app', // Add your Netlify URL
    'https://your-custom-domain.com' // If you have a custom domain
  ],
  credentials: true
}));
```

### 3.2 Commit and Push
```bash
git add server/index.js
git commit -m "Update CORS for production"
git push origin main
```

Render/Railway will automatically redeploy.

---

## Step 4: Test Your Deployment

1. Visit your Netlify URL
2. Wait for the loading screen (4 seconds)
3. Select a dining hall, date, and meal
4. Verify menu items load
5. Click on items to see nutrition data
6. Add items to "My Meal" and verify totals

### Troubleshooting:
- **Loading forever**: Check if backend is awake (visit backend URL directly)
- **CORS errors**: Update CORS settings in backend
- **API errors**: Check Render/Railway logs for backend errors
- **Build fails**: Check build logs in Netlify

---

## Environment Variables Summary

### Frontend (Netlify)
- `VITE_API_URL`: Your backend URL (e.g., `https://harvardmacros-api.onrender.com`)

### Backend (Render/Railway)
- `PORT`: Auto-set by hosting provider
- No additional env vars needed

---

## Costs

- **Netlify**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month, spins down after inactivity)
- **Railway**: Free ($5 credit/month, ~500 hours)

### Recommended for Production:
- **Render Paid**: $7/month (always-on, no spin-down)
- **Railway Paid**: $5/month (500 hours, then pay-as-you-go)

---

## Monitoring

### Backend Logs (Render):
1. Go to your service dashboard
2. Click **"Logs"** tab
3. See real-time server logs

### Frontend Logs (Netlify):
1. Go to your site dashboard
2. Click **"Functions"** or **"Deploys"**
3. Check build logs and deploy logs

---

## Continuous Deployment

Both Netlify and Render/Railway support automatic deployments:

1. Push to GitHub main branch
2. Services automatically detect changes
3. Rebuild and redeploy
4. Live in 2-5 minutes

---

## Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vite Env Vars**: https://vitejs.dev/guide/env-and-mode.html

---

## Quick Commands

```bash
# Local development
npm run dev              # Frontend (port 5173)
node server/index.js     # Backend (port 3001)

# Build for production
npm run build            # Creates dist/ folder

# Preview production build locally
npm run preview          # Serves dist/ folder
```

Good luck with your deployment! 🚀

