# Data Structures Documentation

This document outlines all the data structures used in the Harvard Macros scraping system.

## Table of Contents
1. [Locations](#locations)
2. [Dates](#dates)
3. [Menu Data](#menu-data)
4. [Nutrition Data](#nutrition-data)
5. [API Endpoints](#api-endpoints)

---

## Locations

### Location Object
```javascript
{
  id: '30',
  name: 'Annenberg',
  locationNum: '30',
  displayName: 'Annenberg Dining Hall'
}
```

### Available Locations
- **Annenberg** (locationNum: `30`) - Freshman dining hall
- **Quincy** (locationNum: `08`) - Quincy House
- **Houses** (locationNum: `38`) - All houses except Quincy
- **Flyby** (locationNum: `29`) - Grab-and-go (lunch only)

---

## Dates

### Date Object
```javascript
{
  formatted: '11%2f20%2f2025',  // URL-encoded format
  display: '11/20/2025',         // Human-readable format
  date: Date,                    // JavaScript Date object
  dayName: 'Wednesday'           // Day of the week
}
```

### Date Range
- **Today + 6 days** (7 days total)
- Dynamically generated based on current date
- Example: If today is Nov 20, dates go through Nov 26

---

## Menu Data

### Single Meal Menu Response
```javascript
{
  location: '30',
  date: '11/20/2025',
  meal: 'Lunch Menu',
  categories: {
    "Today's Soup": [
      {
        name: 'Chicken Noodle Soup',
        vegan: false,
        vegetarian: false,
        halal: false,
        nutritionLink: null
      },
      {
        name: 'Sweet Potato Chipotle',
        vegan: true,
        vegetarian: true,
        halal: false,
        nutritionLink: null
      }
    ],
    "Salad Bar": [
      {
        name: 'Black Beans',
        vegan: true,
        vegetarian: true,
        halal: false,
        nutritionLink: null
      },
      {
        name: 'Caesar Salad',
        vegan: false,
        vegetarian: true,
        halal: false,
        nutritionLink: null
      }
    ],
    "Entrees": [
      {
        name: 'Grilled Chicken Breast',
        vegan: false,
        vegetarian: false,
        halal: false,
        nutritionLink: null
      },
      {
        name: 'Cheese Pizza',
        vegan: false,
        vegetarian: true,
        halal: false,
        nutritionLink: null
      }
    ],
    "Desserts": [
      {
        name: 'Chocolate Chip Cookies',
        vegan: false,
        vegetarian: true,
        halal: false,
        nutritionLink: null
      }
    ]
  },
  itemCount: 6
}
```

### All Meals Response
```javascript
{
  location: '30',
  date: '11/20/2025',
  meals: {
    breakfast: {
      "Breakfast Meats": [...],
      "Breakfast Entrees": [...],
      "Fresh Fruit": [...]
    },
    lunch: {
      "Today's Soup": [...],
      "Salad Bar": [...],
      "Entrees": [...]
    },
    dinner: {
      "Entrees": [...],
      "From the Grill": [...],
      "Desserts": [...]
    }
  }
}
```

---

## Nutrition Data

### Nutrition Request Body
```javascript
{
  location: '30',
  date: '11%2f20%2f2025',
  meal: 'Lunch Menu',
  items: [
    {
      name: 'Sliced Cucumbers',
      quantity: 2
    },
    {
      name: 'Sorghum',
      quantity: 2
    }
  ]
}
```

### Nutrition Response
```javascript
{
  items: [
    {
      name: 'Sliced Cucumbers',
      portion: '1 OZ',
      quantity: 2,
      macros: {
        'Fat-T': 0.076,      // Total Fat (g)
        'Chol': 0.000,       // Cholesterol (mg)
        'Sod': 0.952,        // Sodium (mg)
        'Carb': 1.028,       // Carbohydrates (g)
        'Prot': 0.282,       // Protein (g)
        'Fat-S': 0.006,      // Saturated Fat (g)
        'TFA': 0.000,        // Trans Fat (g)
        'Fiber': 0.334,      // Fiber (g)
        'Sugar': 0.658,      // Sugar (g)
        'Cals': 5.716        // Calories (kcal)
      },
      minerals: {
        'Iron': 0.104,       // Iron (mg)
        'Potas': 64.774,     // Potassium (mg)
        'D-mcg': 0.000,      // Vitamin D (mcg)
        'SugAdd': 0.000      // Added Sugar (g)
      }
    },
    {
      name: 'Sorghum',
      portion: '2 OZ',
      quantity: 2,
      macros: {
        'Fat-T': 3.240,
        'Chol': 0.000,
        'Sod': 405.000,
        'Carb': 81.000,
        'Prot': 12.960,
        'Fat-S': 0.000,
        'TFA': 0.000,
        'Fiber': 6.480,
        'Sugar': 0.000,
        'Cals': 388.800
      },
      minerals: {
        'Iron': 3.240,
        'Potas': 0.000,
        'D-mcg': 0.000,
        'SugAdd': 0.000
      }
    }
  ],
  totals: {
    name: '*** TOTALS FOR MEAL ***',
    portion: null,
    quantity: 3,
    macros: {
      'Fat-T': 3.393,
      'Chol': 0.000,
      'Sod': 407.313,
      'Carb': 84.133,
      'Prot': 13.632,
      'Fat-S': 0.033,
      'TFA': 0.000,
      'Fiber': 7.585,
      'Sugar': 1.747,
      'Cals': 403.588
    },
    minerals: {
      'Iron': 3.498,
      'Potas': 144.154,
      'D-mcg': 0.000,
      'SugAdd': 0.000
    }
  }
}
```

### Calculated Totals Response
```javascript
{
  calories: 403.588,
  totalFat: 3.393,
  saturatedFat: 0.033,
  transFat: 0.000,
  cholesterol: 0.000,
  sodium: 407.313,
  carbohydrates: 84.133,
  fiber: 7.585,
  sugar: 1.747,
  addedSugar: 0.000,
  protein: 13.632,
  iron: 3.498,
  potassium: 144.154,
  vitaminD: 0.000
}
```

### Detailed Item Information
```javascript
{
  name: 'Grilled Chicken Breast',
  portion: '4 OZ',
  nutrition: {
    calories: 187,
    totalFat: 4.1,
    saturatedFat: 1.2,
    transFat: 0.0,
    cholesterol: 96,
    sodium: 84,
    carbohydrates: 0.0,
    fiber: 0.0,
    sugar: 0.0,
    addedSugar: 0.0,
    protein: 35.2
  },
  vitamins: {
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0.3,
    calcium: 15
  },
  minerals: {
    iron: 1.2,
    potassium: 256
  },
  ingredients: 'Chicken breast, salt, pepper, olive oil',
  allergens: ['None']
}
```

---

## API Endpoints

### GET `/api/locations`
Returns all available dining locations.

**Response:**
```javascript
{
  ANNENBERG: { id: '30', name: 'Annenberg', ... },
  QUINCY: { id: '08', name: 'Quincy', ... },
  HOUSES: { id: '38', name: 'Houses', ... },
  FLYBY: { id: '29', name: 'Flyby', ... }
}
```

### GET `/api/dates`
Returns available dates (today + 6 days).

**Response:**
```javascript
[
  {
    formatted: '11%2f20%2f2025',
    display: '11/20/2025',
    date: '2025-11-20T00:00:00.000Z',
    dayName: 'Thursday'
  },
  // ... 6 more dates
]
```

### GET `/api/meals`
Returns available meal types.

**Response:**
```javascript
{
  BREAKFAST: 'Breakfast Menu',
  LUNCH: 'Lunch Menu',
  DINNER: 'Dinner Menu'
}
```

### GET `/api/menu`
Get menu for a specific location, date, and meal.

**Query Parameters:**
- `location` - Location number (default: '30')
- `date` - Date in format MM%2fDD%2fYYYY (default: today)
- `meal` - Meal name (default: 'Lunch Menu')

**Example:**
```
GET /api/menu?location=30&date=11%2f20%2f2025&meal=Lunch%20Menu
```

### GET `/api/menu/all`
Get all meals for a location and date.

**Query Parameters:**
- `location` - Location number (default: '30')
- `date` - Date in format MM%2fDD%2fYYYY (default: today)

**Example:**
```
GET /api/menu/all?location=30&date=11%2f20%2f2025
```

### POST `/api/nutrition`
Get nutrition data for selected items.

**Request Body:**
```javascript
{
  location: '30',
  date: '11%2f20%2f2025',
  meal: 'Lunch Menu',
  items: [
    { name: 'Sliced Cucumbers', quantity: 2 },
    { name: 'Sorghum', quantity: 2 }
  ]
}
```

### GET `/api/nutrition/item`
Get detailed nutrition info for a single item.

**Query Parameters:**
- `url` - URL to the item's nutrition page

### POST `/api/nutrition/calculate`
Calculate totals for selected items.

**Request Body:**
```javascript
{
  items: [
    { macros: { Cals: 100, 'Fat-T': 5, ... }, minerals: { ... } },
    { macros: { Cals: 200, 'Fat-T': 10, ... }, minerals: { ... } }
  ]
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```javascript
{
  status: 'ok',
  timestamp: '2025-11-20T12:00:00.000Z',
  locations: 4,
  availableDates: 7
}
```

---

## Meal Types by Location

### Annenberg, Quincy, Houses
- Breakfast Menu
- Lunch Menu
- Dinner Menu

### Flyby
- Lunch Menu only

---

## Notes

1. **Date Format**: Dates in URLs use `%2f` instead of `/` (e.g., `11%2f20%2f2025`)
2. **Meal Names**: Must include " Menu" suffix (e.g., "Lunch Menu" not "Lunch")
3. **Dietary Icons**: 
   - `vgn.gif` = Vegan
   - `veg.gif` = Vegetarian
   - `Hal.gif` = Halal
4. **Nutrition Data**: Requires POST request with selected items and quantities
5. **Dynamic URLs**: All URLs are built dynamically based on location, date, and meal




