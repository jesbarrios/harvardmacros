import axios from 'axios';
import * as cheerio from 'cheerio';
import { buildNutritionUrl, getMealName } from './locations.js';

/**
 * Scrapes nutritional information for a single menu item
 * @param {string} locationNum - Location number
 * @param {string} date - Date in format MM%2fDD%2fYYYY
 * @param {string} mealType - Meal type ('breakfast', 'lunch', 'dinner')
 * @param {string} itemName - Name of the menu item
 * @returns {Object} Nutritional data
 */
export async function scrapeItemNutrition(locationNum, date, mealType, itemName) {
  const mealName = getMealName(locationNum, mealType);
  
  // Build URL to the long menu page where we can find the RecNumAndPort
  const menuUrl = `https://www.foodpro.huds.harvard.edu/foodpro/longmenucopy.aspx?sName=HARVARD+UNIVERSITY+DINING+SERVICES&locationNum=${locationNum}&locationName=Dining+Hall&naFlag=1&WeeksMenus=This+Week%27s+Menus&dtdate=${date}&mealName=${encodeURIComponent(mealName)}`;
  
  try {
    console.log(`Fetching nutrition for "${itemName}" at location ${locationNum}, meal ${mealType}`);
    
    // Get the menu page to find the RecNumAndPort
    const response = await axios.get(menuUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Find the item link and extract RecNumAndPort
    let recNumAndPort = null;
    $('a').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text === itemName) {
        const href = $(elem).attr('href');
        if (href && href.includes('menudetail.aspx')) {
          const match = href.match(/RecNumAndPort=([^&]+)/);
          if (match) {
            recNumAndPort = match[1];
          }
        }
      }
    });
    
    if (!recNumAndPort) {
      console.log(`Could not find RecNumAndPort for "${itemName}"`);
      return null;
    }
    
    console.log(`Found RecNumAndPort: ${recNumAndPort}`);
    
    // Now fetch the menudetail page to get nutrition info
    const detailUrl = `https://www.foodpro.huds.harvard.edu/foodpro/menudetail.aspx?locationNum=${locationNum}&locationName=Dining+Hall&dtdate=${date}&RecNumAndPort=${recNumAndPort}`;
    
    const detailResponse = await axios.get(detailUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $detail = cheerio.load(detailResponse.data);
    
    // Parse the nutrition label
    const nutritionData = {
      name: itemName,
      servingSize: null,
      calories: 0,
      macros: {
        protein: 0,
        carbs: 0,
        fat: 0,
        saturatedFat: 0,
        transFat: 0,
        fiber: 0,
        sugar: 0,
        addedSugar: 0
      },
      micronutrients: {
        cholesterol: 0,
        sodium: 0,
        potassium: 0,
        calcium: 0,
        iron: 0,
        vitaminD: 0
      }
    };
    
    // Extract serving size from HTML
    const html = detailResponse.data;
    const servingSizeMatch = html.match(/Serving size[\s\S]{0,100}?(\d+\s+(?:EACH|OZ|OZL|G|ML|PIECE|ROLL|CUP))/i);
    if (servingSizeMatch) {
      nutritionData.servingSize = servingSizeMatch[1].trim();
    }
    
    // Parse all text content to find nutrition values
    const fullText = $detail.text();
    
    // Extract calories
    const caloriesMatch = fullText.match(/Calories(?:per serving)?\s*(\d+)/i);
    if (caloriesMatch) {
      nutritionData.calories = parseFloat(caloriesMatch[1]);
    }
    
    // Extract fat
    const fatMatch = fullText.match(/(?:Total )?Fat\s+([\d.]+)g/i);
    if (fatMatch) {
      nutritionData.macros.fat = parseFloat(fatMatch[1]);
    }
    
    // Extract saturated fat
    const satFatMatch = fullText.match(/Saturated Fat\s+([\d.]+)g/i);
    if (satFatMatch) {
      nutritionData.macros.saturatedFat = parseFloat(satFatMatch[1]);
    }
    
    // Extract trans fat
    const transFatMatch = fullText.match(/Trans (?:Fatty Acid|Fat)\s+([\d.]+)g/i);
    if (transFatMatch) {
      nutritionData.macros.transFat = parseFloat(transFatMatch[1]);
    }
    
    // Extract cholesterol
    const cholMatch = fullText.match(/Cholesterol\s+([\d.]+)mg/i);
    if (cholMatch) {
      nutritionData.micronutrients.cholesterol = parseFloat(cholMatch[1]);
    }
    
    // Extract sodium
    const sodiumMatch = fullText.match(/Sodium\s+([\d.]+)mg/i);
    if (sodiumMatch) {
      nutritionData.micronutrients.sodium = parseFloat(sodiumMatch[1]);
    }
    
    // Extract carbohydrates
    const carbMatch = fullText.match(/(?:Total )?Carbohydrates?\s+([\d.]+)g/i);
    if (carbMatch) {
      nutritionData.macros.carbs = parseFloat(carbMatch[1]);
    }
    
    // Extract fiber
    const fiberMatch = fullText.match(/Dietary Fiber\s+([\d.]+)g/i);
    if (fiberMatch) {
      nutritionData.macros.fiber = parseFloat(fiberMatch[1]);
    }
    
    // Extract sugar
    const sugarMatch = fullText.match(/Total Sugars\s+([\d.]+)g/i);
    if (sugarMatch) {
      nutritionData.macros.sugar = parseFloat(sugarMatch[1]);
    }
    
    // Extract added sugar
    const addedSugarMatch = fullText.match(/(?:Added Sugars?|Includes\s+[\d.]+g\s+Added Sugars?)\s+([\d.]+)g/i);
    if (addedSugarMatch) {
      nutritionData.macros.addedSugar = parseFloat(addedSugarMatch[1]);
    }
    
    // Extract protein
    const proteinMatch = fullText.match(/Protein\s+([\d.]+)g/i);
    if (proteinMatch) {
      nutritionData.macros.protein = parseFloat(proteinMatch[1]);
    }
    
    // Extract iron
    const ironMatch = fullText.match(/Iron\s+([\d.]+)mg/i);
    if (ironMatch) {
      nutritionData.micronutrients.iron = parseFloat(ironMatch[1]);
    }
    
    // Extract potassium
    const potassiumMatch = fullText.match(/Potassium\s+([\d.]+)mg/i);
    if (potassiumMatch) {
      nutritionData.micronutrients.potassium = parseFloat(potassiumMatch[1]);
    }
    
    // Extract vitamin D
    const vitDMatch = fullText.match(/Vitamin D[^0-9]+([\d.]+)mcg/i);
    if (vitDMatch) {
      nutritionData.micronutrients.vitaminD = parseFloat(vitDMatch[1]);
    }
    
    // Extract calcium
    const calciumMatch = fullText.match(/Calcium\s+([\d.]+)mg/i);
    if (calciumMatch) {
      nutritionData.micronutrients.calcium = parseFloat(calciumMatch[1]);
    }
    
    console.log(`✅ Successfully fetched nutrition for "${itemName}"`);
    return nutritionData;
    
  } catch (error) {
    console.error(`Error scraping nutrition for "${itemName}":`, error.message);
    return null;
  }
}

/**
 * Scrapes nutritional information for selected menu items
 * @param {string} locationNum - Location number
 * @param {string} date - Date in format MM%2fDD%2fYYYY
 * @param {string} mealName - Meal name
 * @param {Array<Object>} items - Array of items with {name, quantity}
 * @returns {Object} Nutritional data
 */
export async function scrapeNutritionData(locationNum, date, mealName, items) {
  const url = buildNutritionUrl(locationNum, date, mealName);
  
  try {
    console.log(`Fetching nutrition data for ${items.length} items...`);
    
    // This would require POST request with form data to submit the items
    // For now, we'll create a structure for what the data looks like
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Parse the nutrition table
    const nutritionData = {
      items: [],
      totals: null
    };
    
    // Find the nutrition table
    $('table').each((i, table) => {
      const $table = $(table);
      const headers = [];
      
      // Get headers
      $table.find('tr').first().find('th, td').each((j, cell) => {
        headers.push($(cell).text().trim());
      });
      
      // Check if this is the nutrition table
      if (headers.includes('Cals') || headers.includes('Fat-T') || headers.includes('Prot')) {
        // Parse data rows
        $table.find('tr').slice(1).each((rowIdx, row) => {
          const $row = $(row);
          const cells = $row.find('td');
          
          if (cells.length > 0) {
            const rowText = $row.text().trim();
            
            // Check if this is the totals row
            if (rowText.includes('TOTALS FOR MEAL')) {
              nutritionData.totals = parseNutritionRow($, cells, headers);
            } else {
              const itemData = parseNutritionRow($, cells, headers);
              if (itemData.name) {
                nutritionData.items.push(itemData);
              }
            }
          }
        });
      }
    });
    
    return nutritionData;
    
  } catch (error) {
    console.error(`Error scraping nutrition data: ${error.message}`);
    throw error;
  }
}

/**
 * Parse a nutrition table row
 * @param {CheerioAPI} $ - Cheerio instance
 * @param {Cheerio} cells - Table cells
 * @param {Array<string>} headers - Column headers
 * @returns {Object} Parsed nutrition data
 */
function parseNutritionRow($, cells, headers) {
  const data = {
    name: null,
    portion: null,
    quantity: null,
    macros: {},
    vitamins: {},
    minerals: {}
  };
  
  cells.each((idx, cell) => {
    const text = $(cell).text().trim();
    const header = headers[idx] || '';
    
    switch(idx) {
      case 0: // Recipe Description
        data.name = text;
        break;
      case 1: // Portion
        data.portion = text;
        break;
      case 2: // Quantity
        data.quantity = parseFloat(text) || 0;
        break;
      default:
        // Parse numeric values
        const value = parseFloat(text.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
          // Map to appropriate category
          if (['Fat-T', 'Chol', 'Sod', 'Carb', 'Prot', 'Fat-S', 'TFA', 'Fiber', 'Sugar', 'Cals'].includes(header)) {
            data.macros[header] = value;
          } else if (['Iron', 'Potas', 'D-mcg', 'SugAdd'].includes(header)) {
            data.minerals[header] = value;
          }
        }
    }
  });
  
  return data;
}

/**
 * Gets detailed nutrition info for a single item
 * This would be called when clicking on an item name
 * @param {string} itemUrl - URL to the item's detailed nutrition page
 * @returns {Object} Detailed nutrition information
 */
export async function scrapeItemDetails(itemUrl) {
  try {
    const response = await axios.get(itemUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    const details = {
      name: '',
      portion: '',
      nutrition: {
        calories: 0,
        totalFat: 0,
        saturatedFat: 0,
        transFat: 0,
        cholesterol: 0,
        sodium: 0,
        carbohydrates: 0,
        fiber: 0,
        sugar: 0,
        addedSugar: 0,
        protein: 0
      },
      vitamins: {},
      minerals: {},
      ingredients: '',
      allergens: []
    };
    
    // Parse the detailed nutrition information
    // This structure would depend on the actual page layout
    
    return details;
    
  } catch (error) {
    console.error(`Error scraping item details: ${error.message}`);
    throw error;
  }
}

/**
 * Calculate nutrition totals for multiple items
 * @param {Array<Object>} items - Array of nutrition data objects
 * @returns {Object} Total nutrition values
 */
export function calculateNutritionTotals(items) {
  const totals = {
    calories: 0,
    totalFat: 0,
    saturatedFat: 0,
    transFat: 0,
    cholesterol: 0,
    sodium: 0,
    carbohydrates: 0,
    fiber: 0,
    sugar: 0,
    addedSugar: 0,
    protein: 0,
    iron: 0,
    potassium: 0,
    vitaminD: 0
  };
  
  items.forEach(item => {
    if (item.macros) {
      totals.calories += item.macros.Cals || 0;
      totals.totalFat += item.macros['Fat-T'] || 0;
      totals.saturatedFat += item.macros['Fat-S'] || 0;
      totals.transFat += item.macros.TFA || 0;
      totals.cholesterol += item.macros.Chol || 0;
      totals.sodium += item.macros.Sod || 0;
      totals.carbohydrates += item.macros.Carb || 0;
      totals.fiber += item.macros.Fiber || 0;
      totals.sugar += item.macros.Sugar || 0;
      totals.protein += item.macros.Prot || 0;
    }
    
    if (item.minerals) {
      totals.iron += item.minerals.Iron || 0;
      totals.potassium += item.minerals.Potas || 0;
      totals.vitaminD += item.minerals['D-mcg'] || 0;
      totals.addedSugar += item.minerals.SugAdd || 0;
    }
  });
  
  return totals;
}
