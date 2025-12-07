# Scraping Functions Reference

Quick reference for all scraping functions available in the Harvard Macros system.

## 📍 Location Functions

### `LOCATIONS`
Object containing all dining hall configurations.

```javascript
import { LOCATIONS } from './server/scrapers/locations.js';

// Available locations
LOCATIONS.ANNENBERG  // { id: '30', name: 'Annenberg', ... }
LOCATIONS.QUINCY     // { id: '08', name: 'Quincy', ... }
LOCATIONS.HOUSES     // { id: '38', name: 'Houses', ... }
LOCATIONS.FLYBY      // { id: '29', name: 'Flyby', ... }
```

### `getAvailableDates()`
Returns array of available dates (today + 6 days).

```javascript
import { getAvailableDates } from './server/scrapers/locations.js';

const dates = getAvailableDates();
// Returns: [
//   {
//     formatted: '11%2f20%2f2025',
//     display: '11/20/2025',
//     date: Date object,
//     dayName: 'Thursday'
//   },
//   ... 6 more dates
// ]
```

### `buildMenuUrl(locationNum, date, mealName)`
Constructs URL for a specific menu page.

```javascript
import { buildMenuUrl } from './server/scrapers/locations.js';

const url = buildMenuUrl('30', '11%2f20%2f2025', 'Lunch Menu');
// Returns: 'https://www.foodpro.huds.harvard.edu/foodpro/longmenucopy.aspx?...'
```

### `buildNutritionUrl(locationNum, date, mealName)`
Constructs URL for nutrition report page.

```javascript
import { buildNutritionUrl } from './server/scrapers/locations.js';

const url = buildNutritionUrl('30', '11%2f20%2f2025', 'Lunch Menu');
// Returns: 'https://www.foodpro.huds.harvard.edu/foodpro/showreport.aspx?...'
```

---

## 🍽️ Menu Scraping Functions

### `scrapeMealMenu(locationNum, date, mealName)`
Scrapes a single meal menu.

```javascript
import { scrapeMealMenu } from './server/scrapers/menuScraper.js';

const menu = await scrapeMealMenu('30', '11%2f20%2f2025', 'Lunch Menu');
// Returns: {
//   location: '30',
//   date: '11/20/2025',
//   meal: 'Lunch Menu',
//   categories: {
//     "Today's Soup": [
//       { name: 'Chicken Noodle Soup', vegan: false, vegetarian: false, halal: false },
//       { name: 'Sweet Potato Chipotle', vegan: true, vegetarian: true, halal: false }
//     ],
//     "Entrees": [...]
//   },
//   itemCount: 58
// }
```

**Parameters:**
- `locationNum` (string) - Location ID ('30', '08', '38', '29')
- `date` (string) - Date in format `MM%2fDD%2fYYYY`
- `mealName` (string) - Meal name ('Breakfast Menu', 'Lunch Menu', 'Dinner Menu')

**Returns:** Object with menu data organized by categories

### `scrapeAllMeals(locationNum, date, meals)`
Scrapes all meals for a location and date.

```javascript
import { scrapeAllMeals } from './server/scrapers/menuScraper.js';

const allMeals = await scrapeAllMeals('30', '11%2f20%2f2025');
// Returns: {
//   location: '30',
//   date: '11/20/2025',
//   meals: {
//     breakfast: { categories... },
//     lunch: { categories... },
//     dinner: { categories... }
//   }
// }

// Or specify specific meals
const someMeals = await scrapeAllMeals('30', '11%2f20%2f2025', ['Lunch Menu', 'Dinner Menu']);
```

**Parameters:**
- `locationNum` (string) - Location ID
- `date` (string) - Date in format `MM%2fDD%2fYYYY`
- `meals` (array, optional) - Array of meal names (defaults to all three meals)

**Returns:** Object with all meal data

---

## 📊 Nutrition Scraping Functions

### `scrapeNutritionData(locationNum, date, mealName, items)`
Scrapes nutrition data for selected items.

```javascript
import { scrapeNutritionData } from './server/scrapers/nutritionScraper.js';

const nutrition = await scrapeNutritionData(
  '30',
  '11%2f20%2f2025',
  'Lunch Menu',
  [
    { name: 'Grilled Chicken Breast', quantity: 1 },
    { name: 'Brown Rice', quantity: 2 }
  ]
);
// Returns: {
//   items: [
//     {
//       name: 'Grilled Chicken Breast',
//       portion: '4 OZ',
//       quantity: 1,
//       macros: { Cals: 187, 'Fat-T': 4.1, Prot: 35.2, ... },
//       minerals: { Iron: 1.2, Potas: 256, ... }
//     },
//     ...
//   ],
//   totals: {
//     name: '*** TOTALS FOR MEAL ***',
//     macros: { Cals: 400, ... },
//     minerals: { ... }
//   }
// }
```

**Parameters:**
- `locationNum` (string) - Location ID
- `date` (string) - Date in format `MM%2fDD%2fYYYY`
- `mealName` (string) - Meal name
- `items` (array) - Array of `{name, quantity}` objects

**Returns:** Object with nutrition data for each item and totals

### `scrapeItemDetails(itemUrl)`
Scrapes detailed nutrition info for a single item.

```javascript
import { scrapeItemDetails } from './server/scrapers/nutritionScraper.js';

const details = await scrapeItemDetails('https://www.foodpro.huds.harvard.edu/...');
// Returns: {
//   name: 'Grilled Chicken Breast',
//   portion: '4 OZ',
//   nutrition: {
//     calories: 187,
//     totalFat: 4.1,
//     saturatedFat: 1.2,
//     protein: 35.2,
//     ...
//   },
//   vitamins: { ... },
//   minerals: { ... },
//   ingredients: 'Chicken breast, salt, pepper...',
//   allergens: ['None']
// }
```

**Parameters:**
- `itemUrl` (string) - Full URL to item's nutrition page

**Returns:** Detailed nutrition information object

### `calculateNutritionTotals(items)`
Calculates total nutrition for multiple items.

```javascript
import { calculateNutritionTotals } from './server/scrapers/nutritionScraper.js';

const totals = calculateNutritionTotals([
  {
    macros: { Cals: 100, 'Fat-T': 5, Carb: 10, Prot: 8 },
    minerals: { Iron: 1.5, Potas: 200 }
  },
  {
    macros: { Cals: 200, 'Fat-T': 10, Carb: 20, Prot: 15 },
    minerals: { Iron: 2.0, Potas: 300 }
  }
]);
// Returns: {
//   calories: 300,
//   totalFat: 15,
//   carbohydrates: 30,
//   protein: 23,
//   iron: 3.5,
//   potassium: 500,
//   ...
// }
```

**Parameters:**
- `items` (array) - Array of nutrition data objects

**Returns:** Object with summed nutrition values

---

## 🔍 Complete Usage Example

```javascript
import { LOCATIONS, getAvailableDates } from './server/scrapers/locations.js';
import { scrapeMealMenu } from './server/scrapers/menuScraper.js';
import { scrapeNutritionData } from './server/scrapers/nutritionScraper.js';

async function getMyLunch() {
  // 1. Get today's date
  const dates = getAvailableDates();
  const today = dates[0].formatted;
  
  // 2. Get Annenberg lunch menu
  const menu = await scrapeMealMenu(
    LOCATIONS.ANNENBERG.locationNum,
    today,
    'Lunch Menu'
  );
  
  console.log(`Found ${menu.itemCount} items in ${Object.keys(menu.categories).length} categories`);
  
  // 3. Select some items
  const myItems = [
    { name: 'Grilled Chicken Breast', quantity: 1 },
    { name: 'Brown Rice', quantity: 1 },
    { name: 'Steamed Broccoli', quantity: 2 }
  ];
  
  // 4. Get nutrition data
  const nutrition = await scrapeNutritionData(
    LOCATIONS.ANNENBERG.locationNum,
    today,
    'Lunch Menu',
    myItems
  );
  
  console.log(`Total calories: ${nutrition.totals.macros.Cals}`);
  console.log(`Total protein: ${nutrition.totals.macros.Prot}g`);
  
  return { menu, nutrition };
}

getMyLunch();
```

---

## 📝 Quick Reference Table

| Function | Purpose | Returns |
|----------|---------|---------|
| `LOCATIONS` | Get location configs | Object |
| `getAvailableDates()` | Get date range | Array |
| `buildMenuUrl()` | Build menu URL | String |
| `buildNutritionUrl()` | Build nutrition URL | String |
| `scrapeMealMenu()` | Scrape single meal | Object |
| `scrapeAllMeals()` | Scrape all meals | Object |
| `scrapeNutritionData()` | Get nutrition data | Object |
| `scrapeItemDetails()` | Get item details | Object |
| `calculateNutritionTotals()` | Sum nutrition | Object |

---

## 🎯 Common Use Cases

### 1. Get Today's Lunch Menu for Annenberg
```javascript
const dates = getAvailableDates();
const menu = await scrapeMealMenu('30', dates[0].formatted, 'Lunch Menu');
```

### 2. Get All Meals for Tomorrow at Quincy
```javascript
const dates = getAvailableDates();
const meals = await scrapeAllMeals('08', dates[1].formatted);
```

### 3. Calculate Nutrition for My Meal
```javascript
const nutrition = await scrapeNutritionData('30', '11%2f20%2f2025', 'Lunch Menu', [
  { name: 'Item 1', quantity: 1 },
  { name: 'Item 2', quantity: 2 }
]);
console.log(`Total: ${nutrition.totals.macros.Cals} calories`);
```

### 4. Get All Locations and Dates
```javascript
const locations = LOCATIONS;
const dates = getAvailableDates();

console.log('Locations:', Object.keys(locations).length);
console.log('Dates:', dates.length);
```

---

## ⚠️ Important Notes

1. **Always use URL-encoded dates**: `11%2f20%2f2025` not `11/20/2025`
2. **Include " Menu" suffix**: `'Lunch Menu'` not `'Lunch'`
3. **Handle errors**: All functions can throw errors if scraping fails
4. **Respect rate limits**: Don't spam requests to Harvard's servers
5. **Flyby is lunch only**: Don't try to scrape breakfast/dinner for location 29

---

## 🧪 Testing

Run the test script to verify all functions:

```bash
node server/test-api.js
```

This will test all locations and display sample output.




