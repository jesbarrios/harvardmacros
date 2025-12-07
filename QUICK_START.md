# 🚀 Quick Start Guide

## Start the Application

### Option 1: Two Terminals

```bash
# Terminal 1 - Backend API
npm run server

# Terminal 2 - Frontend
npm run dev
```

### Option 2: Single Command (if you have concurrently installed)

```bash
npm run dev:all
```

## Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## How to Use

1. **Open the app** at http://localhost:5173
2. **Click "Menu"** in the navigation
3. **Select a location** from the dropdown (Annenberg, Quincy, Houses, Flyby)
4. **Choose a meal** (Breakfast, Lunch, Dinner)
5. **Click any menu item** to see its nutrition facts
6. **Click again** to collapse

## Features

✅ **Real-time menu data** from Harvard Dining Services  
✅ **Real nutrition facts** scraped from HUDS  
✅ **4 dining locations** (Annenberg, Quincy, Houses, Flyby)  
✅ **7 days of menus** (today + 6 days)  
✅ **Dietary filters** (Vegan, Vegetarian, Halal)  
✅ **Inline nutrition display** (no modals!)  
✅ **Smart caching** (instant re-expand)  
✅ **Beautiful UI** with Tailwind CSS  

## API Endpoints

### Get Locations
```bash
GET /api/locations
```

### Get Menu
```bash
GET /api/menu?location=30&meal=breakfast
```

### Get All Meals
```bash
GET /api/menu/all?location=30
```

### Get Nutrition for Item
```bash
GET /api/nutrition/item?location=30&date=11%2f20%2f2025&meal=breakfast&name=Belgian%20Waffles
```

## Troubleshooting

### Backend not starting?
```bash
# Kill any existing node processes
pkill -9 node

# Restart
npm run server
```

### Frontend not loading?
```bash
# Make sure dependencies are installed
npm install

# Restart
npm run dev
```

### "Could not find nutrition information"?

**Possible causes:**
- Item name doesn't match exactly
- Menu changed for that date
- Location doesn't serve that item

**Solution:** Try a different item or check the date

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express
- **Scraping:** Axios + Cheerio
- **Data Source:** Harvard University Dining Services (HUDS)

## Project Structure

```
harvardmacros/
├── src/
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Menu.jsx          # Menu browser with nutrition
│   │   └── NotFound.jsx      # 404 page
│   ├── components/
│   │   └── Layout.jsx        # Shared layout/nav
│   └── App.jsx               # Router setup
├── server/
│   ├── index.js              # Express API server
│   └── scrapers/
│       ├── locations.js      # Location configs
│       ├── menuScraper.js    # Menu scraping logic
│       └── nutritionScraper.js # Nutrition scraping logic
└── package.json
```

## Need Help?

Check these files:
- `NUTRITION_IMPLEMENTATION.md` - Detailed implementation docs
- `FIXES.md` - History of fixes and solutions
- `README.md` - Project overview

---

**Enjoy tracking your Harvard dining macros!** 🎓🍽️




