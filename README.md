# Harvard Macros 🍽️

A comprehensive React + Vite + Tailwind CSS application that scrapes and displays Harvard University dining hall menu data with full nutritional information.

## ✨ Features

- 🏛️ **Multiple Locations**: Annenberg, Quincy House, and All Houses
- 📅 **Date Selection**: View menus for today + 6 days ahead
- 🍳 **Meal Types**: Breakfast, Lunch, and Dinner
- 🏷️ **Dietary Labels**: Vegan, Vegetarian, and Halal indicators
- 📊 **Nutrition Data**: Complete macros and micronutrients for each item
- 🧮 **Meal Calculator**: Select items and calculate total nutrition
- ⚡ **Fast & Modern**: Built with Vite for lightning-fast development
- 💾 **Smart Caching**: localStorage caching for instant loading (expires daily at midnight)
- 🛒 **Persistent Cart**: Your meal selections survive page refreshes
- 🎨 **Beautiful UI**: Tailwind CSS with responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd harvardmacros

# Install dependencies
npm install
```

### Running the Application

You need to run both the backend (scraping server) and frontend:

**Option 1: Run both together (recommended)**
```bash
npm run dev:all
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **API Docs**: See [API.md](server/API.md)

## 📁 Project Structure

```
harvardmacros/
├── server/
│   ├── scrapers/
│   │   ├── locations.js       # Location configs & date utils
│   │   ├── menuScraper.js     # Menu scraping logic
│   │   └── nutritionScraper.js # Nutrition data scraping
│   ├── index.js               # Express API server
│   ├── API.md                 # API documentation
│   ├── DATA_STRUCTURES.md     # Data structure reference
│   └── test-api.js            # Testing script
├── src/
│   ├── assets/                # Static assets
│   ├── components/            # React components
│   │   └── Layout.jsx
│   ├── pages/                 # Page components
│   │   ├── Home.jsx
│   │   ├── Menu.jsx
│   │   └── NotFound.jsx
│   ├── App.jsx                # Main app with routing
│   └── main.jsx               # Entry point
├── public/
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🍽️ Available Dining Locations

| Location | ID | Meals Available |
|----------|-----|-----------------|
| **Annenberg** | 30 | Breakfast, Lunch, Dinner |
| **Quincy House** | 08 | Breakfast, Lunch, Dinner |
| **Houses (except Quincy)** | 38 | Breakfast, Lunch, Dinner |

## 📊 Data Scraped

### Menu Information
- Food item names
- Categories (Entrees, Salad Bar, Desserts, etc.)
- Dietary restrictions (Vegan, Vegetarian, Halal)
- Available for 7 days (today + 6 days)

### Nutrition Information
- **Macronutrients**: Calories, Protein, Carbs, Fat, Fiber, Sugar
- **Micronutrients**: Iron, Potassium, Vitamin D, Sodium
- **Detailed Info**: Cholesterol, Saturated Fat, Trans Fat, Added Sugar
- **Portion Sizes**: Serving size and quantity

## 🔧 API Endpoints

### Core Endpoints

- `GET /api/locations` - Get all dining locations
- `GET /api/dates` - Get available dates
- `GET /api/menu` - Get menu for specific location/date/meal
- `GET /api/menu/all` - Get all meals for a date
- `POST /api/nutrition` - Get nutrition data for items
- `GET /api/health` - Health check

See [API.md](server/API.md) for complete API documentation.

## 🧪 Testing

Test the scraping system:

```bash
node server/test-api.js
```

This will test all locations and display sample data.

## 📖 Documentation

- **[API Documentation](server/API.md)** - Complete API reference
- **[Data Structures](server/DATA_STRUCTURES.md)** - All data formats and structures
- **[Caching System](CACHING.md)** - How localStorage caching works

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web server
- **Axios** - HTTP client for scraping
- **Cheerio** - HTML parsing

## 📝 Scripts

```bash
npm run dev          # Start frontend only
npm run server       # Start backend only
npm run dev:all      # Start both frontend and backend
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🚀 Deployment

Ready to deploy to production? See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment instructions.

**Quick Summary:**
- **Frontend**: Deploy to Netlify (free)
- **Backend**: Deploy to Render or Railway (free tier available)
- **Total Cost**: $0 for free tier, or $7-12/month for always-on service

## 🌐 Data Source

All data is scraped from the official [Harvard University Dining Services (HUDS)](https://www.foodpro.huds.harvard.edu/) website.

## ⚠️ Important Notes

1. **Date Format**: URLs use `%2f` instead of `/` (e.g., `11%2f20%2f2025`)
2. **Meal Names**: Must include " Menu" suffix (e.g., "Lunch Menu")
3. **Rate Limiting**: Be respectful of Harvard's servers
4. **Data Accuracy**: Menu data comes directly from HUDS but may change

## 🤝 Contributing

This is a personal project for Harvard students. Feel free to fork and customize!

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🎓 Made for Harvard Students

Built to help Harvard students track their nutrition and plan their meals across all dining halls.

---

**Note**: This project is not officially affiliated with Harvard University or HUDS.
