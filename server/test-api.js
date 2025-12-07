// Test script to verify all scraping functions
import { LOCATIONS, getAvailableDates } from './scrapers/locations.js';
import { scrapeMealMenu } from './scrapers/menuScraper.js';

async function testAllLocations() {
  console.log('🧪 Testing Harvard Macros Scraping System\n');
  
  const dates = getAvailableDates();
  console.log(`📅 Available dates: ${dates.length}`);
  console.log(`   First date: ${dates[0].display} (${dates[0].dayName})`);
  console.log(`   Last date: ${dates[dates.length - 1].display} (${dates[dates.length - 1].dayName})\n`);
  
  const testDate = dates[0].formatted;
  
  // Test each location
  for (const [key, location] of Object.entries(LOCATIONS)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📍 Testing ${location.displayName} (${location.locationNum})`);
    console.log('='.repeat(60));
    
    // Test lunch menu (all locations have lunch)
    try {
      console.log(`\n🍽️  Fetching Lunch Menu...`);
      const lunchData = await scrapeMealMenu(location.locationNum, testDate, 'lunch');
      
      console.log(`✅ Success!`);
      console.log(`   Categories: ${Object.keys(lunchData.categories).length}`);
      console.log(`   Total items: ${lunchData.itemCount}`);
      
      // Show first category as example
      const firstCategory = Object.keys(lunchData.categories)[0];
      if (firstCategory) {
        console.log(`\n   Example category: "${firstCategory}"`);
        const items = lunchData.categories[firstCategory].slice(0, 3);
        items.forEach(item => {
          const tags = [];
          if (item.vegan) tags.push('🌱 Vegan');
          if (item.vegetarian) tags.push('🥬 Vegetarian');
          if (item.halal) tags.push('☪️ Halal');
          console.log(`      - ${item.name} ${tags.join(' ')}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Skip breakfast/dinner for Flyby (lunch only)
    if (location.name === 'Flyby') {
      console.log(`\n⏭️  Skipping breakfast/dinner (Flyby is lunch only)`);
      continue;
    }
    
    // Test breakfast
    try {
      console.log(`\n🥞 Fetching Breakfast Menu...`);
      const breakfastData = await scrapeMealMenu(location.locationNum, testDate, 'breakfast');
      console.log(`✅ Success! ${breakfastData.itemCount} items`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Test dinner
    try {
      console.log(`\n🍝 Fetching Dinner Menu...`);
      const dinnerData = await scrapeMealMenu(location.locationNum, testDate, 'dinner');
      console.log(`✅ Success! ${dinnerData.itemCount} items`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('✨ Testing complete!');
  console.log('='.repeat(60));
}

// Run tests
testAllLocations().catch(console.error);

