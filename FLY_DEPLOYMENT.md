# Fly.io Deployment Guide (Alternative to Railway)

Fly.io offers a generous free tier with **always-on** services (no cold starts!).

## Why Fly.io?

- ✅ **Always-on** (no sleep/spin-down)
- ✅ **3 free VMs** with 256MB RAM each
- ✅ **Fast** - Boston region (closest to Harvard)
- ✅ **No credit limits** - truly free tier

---

## Prerequisites

1. Install Fly CLI:
   ```bash
   # macOS
   brew install flyctl
   
   # Or use curl
   curl -L https://fly.io/install.sh | sh
   ```

2. Sign up and login:
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

---

## Deployment Steps

### 1. Initialize Fly App

```bash
# Navigate to your project
cd /path/to/harvardmacros

# Launch (this creates fly.toml)
fly launch --name harvardmacros-api --region bos --no-deploy
```

When prompted:
- **Copy configuration to fly.toml?** → Yes
- **Create .dockerignore?** → Yes
- **Would you like to set up a PostgreSQL database?** → No
- **Would you like to set up Redis?** → No

### 2. Update fly.toml

The `fly.toml` file is already created in your project. It's configured for:
- Boston region (closest to Harvard)
- Always-on (no auto-stop)
- 256MB RAM (free tier)

### 3. Create Dockerfile

Fly.io needs a Dockerfile to build your app:

```bash
# This will be created automatically, but here's what it should contain
```

Create `Dockerfile` in your project root:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy server code
COPY server ./server

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server/index.js"]
```

### 4. Create .dockerignore

Create `.dockerignore` in your project root:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
dist
src
public
*.md
vite.config.js
tailwind.config.js
postcss.config.js
index.html
```

### 5. Deploy!

```bash
fly deploy
```

This will:
1. Build your Docker image
2. Push to Fly.io
3. Deploy to Boston region
4. Give you a URL like: `https://harvardmacros-api.fly.dev`

### 6. Get Your URL

```bash
fly status
```

Copy your app URL (e.g., `https://harvardmacros-api.fly.dev`)

### 7. Update Netlify

1. Go to Netlify → Site configuration → Environment variables
2. Update `VITE_API_URL` to your Fly.io URL
3. Redeploy your Netlify site

---

## Useful Commands

```bash
# Check app status
fly status

# View logs
fly logs

# Open app in browser
fly open

# SSH into your app
fly ssh console

# Scale (if needed)
fly scale count 1

# Check resource usage
fly dashboard
```

---

## Monitoring

```bash
# Real-time logs
fly logs -a harvardmacros-api

# Check if app is running
fly status -a harvardmacros-api
```

---

## Costs

- **Free Tier**: 
  - 3 shared-cpu VMs
  - 160GB outbound data transfer
  - 3GB persistent storage
  
- **Your Usage**: Well within free tier!

---

## Troubleshooting

### App won't start
```bash
fly logs
# Check for errors in the logs
```

### Port issues
Make sure `server/index.js` uses `process.env.PORT`:
```javascript
const PORT = process.env.PORT || 3001;
```

### Memory issues
If you need more RAM:
```bash
fly scale memory 512
```
(This may require paid plan)

---

## Comparison: Railway vs Fly.io

| Feature | Railway | Fly.io |
|---------|---------|--------|
| Free Tier | $5 credit/month | 3 VMs always-on |
| Cold Starts | No | No |
| Setup | Easier | Slightly harder |
| Speed | Fast | Fast |
| Longevity | Credit runs out | Truly free |

**Verdict**: Both are great! Railway is easier, Fly.io is more sustainable long-term.

---

## Need Help?

- **Fly.io Docs**: https://fly.io/docs
- **Community**: https://community.fly.io
- **Status**: https://status.fly.io

---

Good luck! 🚀

