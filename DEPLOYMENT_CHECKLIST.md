# Deployment Checklist ✅

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

- [ ] All code is committed and pushed to GitHub
- [ ] Application runs locally without errors
- [ ] All console.logs removed from frontend
- [ ] Environment variables are documented

## Backend Deployment (Render/Railway)

- [ ] Create account on Render.com or Railway.app
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - [ ] Build command: `npm install`
  - [ ] Start command: `node server/index.js`
  - [ ] Environment: Node
- [ ] Deploy backend
- [ ] Test backend URL (visit `/api/health` endpoint)
- [ ] Copy backend URL for frontend configuration

## Frontend Deployment (Netlify)

- [ ] Create account on Netlify.com
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] Add environment variable:
  - [ ] Key: `VITE_API_URL`
  - [ ] Value: Your backend URL (e.g., `https://your-app.onrender.com`)
- [ ] Deploy frontend
- [ ] Copy frontend URL

## Post-Deployment Configuration

- [ ] Update CORS in `server/index.js` with your Netlify URL
- [ ] Commit and push CORS changes
- [ ] Wait for backend to redeploy

## Testing

- [ ] Visit your Netlify URL
- [ ] Wait for loading screen (4 seconds)
- [ ] Test location selection
- [ ] Test date selection
- [ ] Test meal selection
- [ ] Verify menu items load
- [ ] Click on items to check nutrition data
- [ ] Add items to "My Meal"
- [ ] Verify macro totals calculate correctly
- [ ] Test micronutrients dropdown
- [ ] Test dietary filters (Vegan, Vegetarian, Halal)
- [ ] Test category filters
- [ ] Test search functionality
- [ ] Test on mobile device
- [ ] Test custom dropdowns on mobile

## Performance Check

- [ ] Loading screen appears only on first load
- [ ] No loading screen on route changes
- [ ] Nutrition data loads quickly
- [ ] No console errors in browser
- [ ] Backend responds within 5 seconds (first request may be slow on free tier)

## Optional Enhancements

- [ ] Set up custom domain on Netlify
- [ ] Upgrade to Render paid tier ($7/month) for always-on backend
- [ ] Set up monitoring/alerts
- [ ] Add analytics (Google Analytics, Plausible, etc.)

## Troubleshooting

If something doesn't work:

1. **Check browser console** for frontend errors
2. **Check Render/Railway logs** for backend errors
3. **Verify environment variables** are set correctly
4. **Test backend directly** by visiting API endpoints
5. **Check CORS settings** if you see CORS errors
6. **Wait 30 seconds** if backend is spinning up from sleep (free tier)

## Success! 🎉

- [ ] Application is live and working
- [ ] Share URL with friends
- [ ] Monitor for any issues
- [ ] Enjoy your deployed app!

---

**Your URLs:**
- Frontend: `https://your-site-name.netlify.app`
- Backend: `https://your-app.onrender.com`

**Next Steps:**
- Consider upgrading to paid tiers for better performance
- Set up continuous deployment (already done via GitHub)
- Monitor usage and costs

