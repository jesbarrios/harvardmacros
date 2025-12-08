import express from 'express';
import cors from 'cors';
import { LOCATIONS, MEAL_TYPES, getAvailableDates, getMealName, getAvailableMeals } from './scrapers/locations.js';
import { scrapeMealMenu, scrapeAllMeals } from './scrapers/menuScraper.js';
import { scrapeNutritionData, scrapeItemDetails, calculateNutritionTotals, scrapeItemNutrition } from './scrapers/nutritionScraper.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allows requests from frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://harvardmacros.com',
  'http://harvardmacros.com',
  'https://www.harvardmacros.com',
  'http://www.harvardmacros.com'
];

// Allow any Netlify preview/production URLs and custom domain
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost, Netlify domains, and harvardmacros.com
    if (allowedOrigins.includes(origin) || origin.includes('.netlify.app') || origin.includes('harvardmacros.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Get available locations
app.get('/api/locations', (req, res) => {
  res.json(LOCATIONS);
});

// Get available dates (today + 6 days)
app.get('/api/dates', (req, res) => {
  res.json(getAvailableDates());
});

// Get available meal types
app.get('/api/meals', (req, res) => {
  res.json(MEAL_TYPES);
});

// Get available meals for a specific location
app.get('/api/meals/:locationNum', (req, res) => {
  try {
    const { locationNum } = req.params;
    const meals = getAvailableMeals(locationNum);
    res.json(meals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get menu for a specific location, date, and meal
app.get('/api/menu', async (req, res) => {
  try {
    const { location, date, meal } = req.query;
    
    // Default to Annenberg, today, and lunch if not specified
    const locationNum = location || LOCATIONS.ANNENBERG.locationNum;
    const dateStr = date || getAvailableDates()[0].formatted;
    const mealType = meal || MEAL_TYPES.LUNCH;
    
    console.log(`Fetching menu for location ${locationNum}, date ${dateStr}, meal ${mealType}`);
    
    const menuData = await scrapeMealMenu(locationNum, dateStr, mealType);
    res.json(menuData);
    
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu data',
      message: error.message 
    });
  }
});

// Get all meals for a location and date
app.get('/api/menu/all', async (req, res) => {
  try {
    const { location, date } = req.query;
    
    const locationNum = location || LOCATIONS.ANNENBERG.locationNum;
    const dateStr = date || getAvailableDates()[0].formatted;
    
    console.log(`Fetching all meals for location ${locationNum}, date ${dateStr}`);
    
    const menuData = await scrapeAllMeals(locationNum, dateStr);
    res.json(menuData);
    
  } catch (error) {
    console.error('Error fetching all meals:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu data',
      message: error.message 
    });
  }
});

// Get nutrition data for selected items
app.post('/api/nutrition', async (req, res) => {
  try {
    const { location, date, meal, items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    const locationNum = location || LOCATIONS.ANNENBERG.locationNum;
    const dateStr = date || getAvailableDates()[0].formatted;
    const mealType = meal || MEAL_TYPES.LUNCH;
    
    console.log(`Fetching nutrition for ${items.length} items`);
    
    const nutritionData = await scrapeNutritionData(locationNum, dateStr, mealType, items);
    res.json(nutritionData);
    
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch nutrition data',
      message: error.message 
    });
  }
});

// Get detailed nutrition info for a single item
app.get('/api/nutrition/item', async (req, res) => {
  try {
    const { location, date, meal, name } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }
    
    const locationNum = location || LOCATIONS.ANNENBERG.locationNum;
    const dateStr = date || getAvailableDates()[0].formatted;
    const mealType = meal || MEAL_TYPES.LUNCH;
    
    console.log(`Fetching nutrition for "${name}" at location ${locationNum}, meal ${mealType}`);
    
    const nutritionData = await scrapeItemNutrition(locationNum, dateStr, mealType, name);
    
    if (!nutritionData) {
      return res.status(404).json({ 
        error: 'Nutrition data not found',
        message: `Could not find nutrition information for "${name}"` 
      });
    }
    
    res.json(nutritionData);
    
  } catch (error) {
    console.error('Error fetching item nutrition:', error);
    res.status(500).json({ 
      error: 'Failed to fetch item nutrition',
      message: error.message 
    });
  }
});

// Calculate totals for selected items
app.post('/api/nutrition/calculate', (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }
    
    const totals = calculateNutritionTotals(items);
    res.json(totals);
    
  } catch (error) {
    console.error('Error calculating totals:', error);
    res.status(500).json({ 
      error: 'Failed to calculate totals',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    locations: Object.keys(LOCATIONS).length,
    availableDates: getAvailableDates().length
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Available locations: ${Object.keys(LOCATIONS).length}`);
  console.log(`📅 Available dates: ${getAvailableDates().length} (today + 6 days)`);
  console.log(`🍽️  Meal types: ${Object.keys(MEAL_TYPES).length}`);
});
