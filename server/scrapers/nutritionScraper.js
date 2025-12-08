import axios from 'axios';
import * as cheerio from 'cheerio';
import { buildNutritionUrl, getMealName } from './locations.js';

/**
 * scrape nutrition info for a single menu item
 * @param {string} locationNum - location number
 * @param {string} date - date in format MM%2fDD%2fYYYY
 * @param {string} mealType - meal type ('breakfast', 'lunch', 'dinner')
 * @param {string} itemName - name of the menu item
 * @returns {Object} nutrition data
 */
export async function scrapeItemNutrition(locationNum, date, mealType, itemName) {
  const mealName = getMealName(locationNum, mealType);
  
  // build url to the full menu page to find recnumandport
  const menuUrl = `https://www.foodpro.huds.harvard.edu/foodpro/longmenucopy.aspx?sName=HARVARD+UNIVERSITY+DINING+SERVICES&locationNum=${locationNum}&locationName=Dining+Hall&naFlag=1&WeeksMenus=This+Week%27s+Menus&dtdate=${date}&mealName=${encodeURIComponent(mealName)}`;
  
  try {
    console.log(`fetching nutrition for "${itemName}" at location ${locationNum}, meal ${mealType}`);
    
    // get the menu page to find recnumandport
    const response = await axios.get(menuUrl, {
      headers: {
        'User-Agent': 'mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/91.0.4472.124 safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // look for the item link and grab recnumandport
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
      console.log(`could not find recnumandport for "${itemName}"`);
      return null;
    }
    
    console.log(`found recnumandport: ${recNumAndPort}`);
    
    // now get the detailed page to pull nutrition info
    const detailUrl = `https://www.foodpro.huds.harvard.edu/foodpro/menudetail.aspx?locationNum=${locationNum}&locationName=Dining+Hall&dtdate=${date}&RecNumAndPort=${recNumAndPort}`;
    
    const detailResponse = await axios.get(detailUrl, {
      headers: {
        'User-Agent': 'mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/91.0.4472.124 safari/537.36'
      }
    });
    
    const $detail = cheerio.load(detailResponse.data);
    
    // set up the structure for nutrition info
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
    
    // extract serving size from html
    const html = detailResponse.data;
    const servingSizeMatch = html.match(/Serving size[\s\S]{0,100}?(\d+\s+(?:EACH|OZ|OZL|G|ML|PIECE|ROLL|CUP))/i);
    if (servingSizeMatch) {
      nutritionData.servingSize = servingSizeMatch[1].trim();
    }
    
    // get all text content to parse nutrition numbers
    const fullText = $detail.text();
    
    // extract calories
    const caloriesMatch = fullText.match(/Calories(?:per serving)?\s*(\d+)/i);
    if (caloriesMatch) {
      nutritionData.calories = parseFloat(caloriesMatch[1]);
    }
    
    // extract fat
    const fatMatch = fullText.match(/(?:Total )?Fat\s+([\d.]+)g/i);
    if (fatMatch) {
      nutritionData.macros.fat = parseFloat(fatMatch[1]);
    }
    
    // extract saturated fat
    const satFatMatch = fullText.match(/Saturated Fat\s+([\d.]+)g/i);
    if (satFatMatch) {
      nutritionData.macros.saturatedFat = parseFloat(satFatMatch[1]);
    }
    
    // extract trans fat
    const transFatMatch = fullText.match(/Trans (?:Fatty Acid|Fat)\s+([\d.]+)g/i);
    if (transFatMatch) {
      nutritionData.macros.transFat = parseFloat(transFatMatch[1]);
    }
    
    // extract cholesterol
    const cholMatch = fullText.match(/Cholesterol\s+([\d.]+)mg/i);
    if (cholMatch) {
      nutritionData.micronutrients.cholesterol = parseFloat(cholMatch[1]);
    }
    
    // extract sodium
    const sodiumMatch = fullText.match(/Sodium\s+([\d.]+)mg/i);
    if (sodiumMatch) {
      nutritionData.micronutrients.sodium = parseFloat(sodiumMatch[1]);
    }
    
    // extract carbs
    const carbMatch = fullText.match(/(?:Total )?Carbohydrates?\s+([\d.]+)g/i);
    if (carbMatch) {
      nutritionData.macros.carbs = parseFloat(carbMatch[1]);
    }
    
    // extract fiber
    const fiberMatch = fullText.match(/Dietary Fiber\s+([\d.]+)g/i);
    if (fiberMatch) {
      nutritionData.macros.fiber = parseFloat(fiberMatch[1]);
    }
    
    // extract sugar
    const sugarMatch = fullText.match(/Total Sugars\s+([\d.]+)g/i);
    if (sugarMatch) {
      nutritionData.macros.sugar = parseFloat(sugarMatch[1]);
    }
    
    // extract added sugar
    const addedSugarMatch = fullText.match(/(?:Added Sugars?|Includes\s+[\d.]+g\s+Added Sugars?)\s+([\d.]+)g/i);
    if (addedSugarMatch) {
      nutritionData.macros.addedSugar = parseFloat(addedSugarMatch[1]);
    }
    
    // extract protein
    const proteinMatch = fullText.match(/Protein\s+([\d.]+)g/i);
    if (proteinMatch) {
      nutritionData.macros.protein = parseFloat(proteinMatch[1]);
    }
    
    // extract iron
    const ironMatch = fullText.match(/Iron\s+([\d.]+)mg/i);
    if (ironMatch) {
      nutritionData.micronutrients.iron = parseFloat(ironMatch[1]);
    }
    
    // extract potassium
    const potassiumMatch = fullText.match(/Potassium\s+([\d.]+)mg/i);
    if (potassiumMatch) {
      nutritionData.micronutrients.potassium = parseFloat(potassiumMatch[1]);
    }
    
    // extract vitamin d
    const vitDMatch = fullText.match(/Vitamin D[^0-9]+([\d.]+)mcg/i);
    if (vitDMatch) {
      nutritionData.micronutrients.vitaminD = parseFloat(vitDMatch[1]);
    }
    
    // extract calcium
    const calciumMatch = fullText.match(/Calcium\s+([\d.]+)mg/i);
    if (calciumMatch) {
      nutritionData.micronutrients.calcium = parseFloat(calciumMatch[1]);
    }
    
    console.log(`✅ successfully fetched nutrition for "${itemName}"`);
    return nutritionData;
    
  } catch (error) {
    console.error(`error scraping nutrition for "${itemName}":`, error.message);
    return null;
  }
}

/**
 * scrape nutrition info for multiple menu items
 * @param {string} locationNum - location number
 * @param {string} date - date in format MM%2fDD%2fYYYY
 * @param {string} mealName - meal name
 * @param {Array<Object>} items - array of items with {name, quantity}
 * @returns {Object} nutrition data
 */
export async function scrapeNutritionData(locationNum, date, mealName, items) {
  const url = buildNutritionUrl(locationNum, date, mealName);
  
  try {
    console.log(`fetching nutrition data for ${items.length} items...`);
    
    // normally would POST form data with items, for now just get page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/91.0.4472.124 safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // structure to hold nutrition data
    const nutritionData = {
      items: [],
      totals: null
    };
    
    // find tables in page
    $('table').each((i, table) => {
      const $table = $(table);
      const headers = [];
      
      // get table headers
      $table.find('tr').first().find('th, td').each((j, cell) => {
        headers.push($(cell).text().trim());
      });
      
      // check if table has nutrition info
      if (headers.includes('Cals') || headers.includes('Fat-T') || headers.includes('Prot')) {
        // parse each data row
        $table.find('tr').slice(1).each((rowIdx, row) => {
          const $row = $(row);
          const cells = $row.find('td');
          
          if (cells.length > 0) {
            const rowText = $row.text().trim();
            
            // see if it's the totals row
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
    console.error(`error scraping nutrition data: ${error.message}`);
    throw error;
  }
}

/**
 * parse a nutrition table row
 * @param {CheerioAPI} $ - cheerio instance
 * @param {Cheerio} cells - table cells
 * @param {Array<string>} headers - column headers
 * @returns {Object} parsed nutrition info
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
      case 0: // item description
        data.name = text;
        break;
      case 1: // portion size
        data.portion = text;
        break;
      case 2: // quantity
        data.quantity = parseFloat(text) || 0;
        break;
      default:
        // parse numeric values
        const value = parseFloat(text.replace(/[^\d.-]/g, ''));
        if (!isNaN(value)) {
          // assign to right category
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
 * get detailed nutrition info for a single item
 * called when clicking on an item
 * @param {string} itemUrl - url to the item's nutrition page
 * @returns {Object} detailed nutrition info
 */
export async function scrapeItemDetails(itemUrl) {
  try {
    const response = await axios.get(itemUrl, {
      headers: {
        'User-Agent': 'mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/91.0.4472.124 safari/537.36'
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
    
    // parse detailed nutrition info here
    // depends on actual page layout
    
    return details;
    
  } catch (error) {
    console.error(`error scraping item details: ${error.message}`);
    throw error;
  }
}

/**
 * calculate total nutrition for multiple items
 * @param {Array<Object>} items - array of nutrition objects
 * @returns {Object} totals for all nutrition values
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
