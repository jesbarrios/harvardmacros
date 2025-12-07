import axios from 'axios';
import * as cheerio from 'cheerio';
import { buildMenuUrl, getMealName, getAvailableMeals } from './locations.js';

/**
 * Scrapes a single meal menu (breakfast, lunch, or dinner)
 * @param {string} locationNum - Location number (e.g., '30' for Annenberg)
 * @param {string} date - Date in format MM%2fDD%2fYYYY
 * @param {string} mealType - Meal type ('breakfast', 'lunch', 'dinner')
 * @returns {Object} Menu data organized by categories
 */
export async function scrapeMealMenu(locationNum, date, mealType) {
  // Get the correct meal name for this location
  const mealName = getMealName(locationNum, mealType);
  const url = buildMenuUrl(locationNum, date, mealName);
  
  try {
    console.log(`Scraping ${mealType} (${mealName}) for location ${locationNum} on ${date}...`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const categories = {};
    let currentCategory = null;
    const seenItems = new Set();
    
    // Parse menu items from table cells
    $('td').each((i, cell) => {
      const $cell = $(cell);
      let text = $cell.text().trim();
      
      if (!text) return;
      
      // Check if this is a category header (starts and ends with --)
      if (text.startsWith('--') && text.endsWith('--')) {
        currentCategory = text.replace(/^--\s*/, '').replace(/\s*--$/, '').trim();
        if (currentCategory && !categories[currentCategory]) {
          categories[currentCategory] = [];
          seenItems.clear();
        }
      } else if (currentCategory && text.length > 0) {
        // Skip navigation text, headers, and serving sizes
        if (text.includes('Menu') || 
            text.includes('Select') || 
            text.includes('nutritional') ||
            text.includes('Click') ||
            text.includes('daypart') ||
            text.includes('Top of Page') ||
            // Skip serving size patterns (e.g., "1/2 CUP", "2 OZ", "1 SLICE", "EACH", etc.)
            /^\d+(\.\d+)?\s*(OZ|EACH|PIECE|SLICE|SLICES|Roll|Pita|OZL|CUP|TBSP|TSP|G|ML|LB|SERVING|SERVINGS)L?$/i.test(text) ||
            /^\d+\/\d+\s*(OZ|EACH|PIECE|SLICE|SLICES|Roll|Pita|OZL|CUP|TBSP|TSP|G|ML|LB|SERVING|SERVINGS)L?$/i.test(text) ||
            text.length > 100) {
          return;
        }
        
        // Skip duplicates
        const itemKey = `${currentCategory}:${text}`;
        if (seenItems.has(itemKey)) {
          return;
        }
        seenItems.add(itemKey);
        
        // Extract dietary information from icons
        const isVegan = $cell.find('img[src*="vgn.gif"]').length > 0;
        const isVegetarian = $cell.find('img[src*="veg.gif"]').length > 0;
        const isHalal = $cell.find('img[src*="hal.gif"], img[src*="Hal.gif"]').length > 0;
        
        // Try to find a link to the item (for nutrition info)
        const itemLink = $cell.find('a').attr('href');
        
        categories[currentCategory].push({
          name: text,
          vegan: isVegan,
          vegetarian: isVegetarian,
          halal: isHalal,
          nutritionLink: itemLink || null
        });
      }
    });
    
    return {
      location: locationNum,
      date: date.replace(/%2f/g, '/'),
      meal: mealType,
      mealName: mealName,
      categories: categories,
      itemCount: Object.values(categories).reduce((sum, items) => sum + items.length, 0)
    };
    
  } catch (error) {
    console.error(`Error scraping meal menu: ${error.message}`);
    // Return empty structure instead of throwing
    return {
      location: locationNum,
      date: date.replace(/%2f/g, '/'),
      meal: mealType,
      mealName: mealName,
      categories: {},
      itemCount: 0,
      error: error.message
    };
  }
}

/**
 * Scrapes all meals for a specific location and date
 * @param {string} locationNum - Location number
 * @param {string} date - Date in format MM%2fDD%2fYYYY
 * @returns {Object} All meals data
 */
export async function scrapeAllMeals(locationNum, date) {
  const results = {
    location: locationNum,
    date: date.replace(/%2f/g, '/'),
    meals: {}
  };
  
  // Get available meals for this location
  const availableMeals = getAvailableMeals(locationNum);
  
  for (const mealType of availableMeals) {
    try {
      const mealData = await scrapeMealMenu(locationNum, date, mealType);
      results.meals[mealType] = mealData.categories;
    } catch (error) {
      console.error(`Failed to scrape ${mealType}:`, error.message);
      results.meals[mealType] = {};
    }
  }
  
  return results;
}

