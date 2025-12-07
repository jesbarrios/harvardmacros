// Dining hall location configurations
export const LOCATIONS = {
  ANNENBERG: {
    id: '30',
    name: 'Annenberg',
    locationNum: '30',
    displayName: 'Annenberg Dining Hall',
    mealNames: {
      breakfast: 'Breakfast Menu',
      lunch: 'Lunch Menu',
      dinner: 'Dinner Menu'
    }
  },
  QUINCY: {
    id: '08',
    name: 'Quincy',
    locationNum: '08',
    displayName: 'Quincy House',
    mealNames: {
      breakfast: 'Breakfast',
      lunch: 'LUNCH',
      dinner: 'DINNER'
    }
  },
  HOUSES: {
    id: '38',
    name: 'Houses',
    locationNum: '38',
    displayName: 'Houses (except Quincy)',
    mealNames: {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner'
    }
  }
};

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner'
};

// Get the correct meal name for a location
export function getMealName(locationNum, mealType) {
  const location = Object.values(LOCATIONS).find(loc => loc.locationNum === locationNum);
  if (!location) {
    throw new Error(`Unknown location: ${locationNum}`);
  }
  
  const mealName = location.mealNames[mealType];
  if (mealName === null) {
    throw new Error(`${location.displayName} does not serve ${mealType}`);
  }
  
  return mealName;
}

// Get available meals for a location
export function getAvailableMeals(locationNum) {
  const location = Object.values(LOCATIONS).find(loc => loc.locationNum === locationNum);
  if (!location) {
    throw new Error(`Unknown location: ${locationNum}`);
  }
  
  const meals = [];
  if (location.mealNames.breakfast) meals.push('breakfast');
  if (location.mealNames.lunch) meals.push('lunch');
  if (location.mealNames.dinner) meals.push('dinner');
  
  return meals;
}

// Get available dates (today + 6 days)
export function getAvailableDates() {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    dates.push({
      formatted: `${month}%2f${day}%2f${year}`, // URL format
      display: `${month}/${day}/${year}`, // Display format
      date: date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
    });
  }
  
  return dates;
}

// Build menu URL for a specific location, date, and meal
export function buildMenuUrl(locationNum, date, mealName) {
  const BASE_URL = 'https://www.foodpro.huds.harvard.edu/foodpro/longmenucopy.aspx';
  return `${BASE_URL}?sName=HARVARD+UNIVERSITY+DINING+SERVICES&locationNum=${locationNum}&locationName=Dining+Hall&naFlag=1&WeeksMenus=This+Week%27s+Menus&dtdate=${date}&mealName=${encodeURIComponent(mealName)}`;
}

// Build nutrition report URL
export function buildNutritionUrl(locationNum, date, mealName) {
  const BASE_URL = 'https://www.foodpro.huds.harvard.edu/foodpro/showreport.aspx';
  return `${BASE_URL}?locationNum=${locationNum}&locationName=Dining+Hall&dtdate=${date}&mealName=${encodeURIComponent(mealName)}&sName=HARVARD+UNIVERSITY+DINING+SERVICES`;
}

