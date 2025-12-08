# Harvard Macros - User Manual

## Video: https://www.youtube.com/watch?v=FpO0Oz3ZOZU 

## Introduction
Harvard Macros is a nutrition tracking website made for Harvard students who use HUDS. The app scrapes real-time menu data from the HUDS website and displays the full macro/micronutrients for every item in each hall. This condenses the current information on the HUDS menu, making data easier to access. Users can browse the daily menus, filter by dietary restrictions, build meals, track macros, and calculate personalized goals based on research-backed formulas. The project is made so that anyone can run it locally. The live app is available at https://harvardmacros.com and https://harvardmacros.netlify.app

## How it works
The system uses React and Vite frontend and Express-based backend. The frontend runs on port 5173 and handles the user interface, faltering, macro calculator, routing, and local caching. The backend runs on port 3001 and is responsible for scraping the HUDS online menus. Both of these components work together, so the website is up to date with the current HUDS menu. All the dining halls that the HUDS website covers is also replicated in Harvard Macros. 

## What you need to run it
Before installing the project, you will need Node.js (v16 or higher but it’s been tested with 18 and 20). And npm v7 or higher. The website can be run on macOS, Windows, or Linux and only needs about 500MB of disk space and at least 4GB of memory. Since all the menus are scraped live from the HUDS website, you will obviously need a internet connection. Using the app in your browser requires Javascript and localStorage to be turned on. Most Modern browsers like Chrome, Firefox, Safari, etc. will work fine. 

## How to install it
To install the project locally, move into the root directory of the project and run npm install. This install all dependencies for both the frontend and backend including React, Vite, Tailwind, Express, Axios, Cheerio, and several smaller libraries. Once installation finishes, you can check the “node_modules” folder to see that everything is working fine. If you see permission errors, fix your npm permissions according to the official Node.js documentation. 

## How to run
The recommended method to run the website is “npm run dev:all” which will start the backend and the frontend, open your browser, and enable hot reload so you can develop without restarting the server. You could also run it by using “npm run server” in one terminal to start the backend on port 3001 and run “npm run dev” in another terminal for the frontend. When both are running, open http://localhost:5173 in your browser. You should then see a loading screen with our Harvard Macros logo followed by the main interface. 

## How to use the Harvard Macros

At the top of the website, you can select the dining hall you’re at, the date, and the type of meal. This will populate the accurate menu in which you can start building your meal. The items are grouped by category (same as the HUDS website), and you can also filter using dietary tags such as Vegan, Vegetarian, and Halal. Additionally, there is a search bar to help you filter by name (also supports partial matches). Below each item, you will see the macro nutrients, and if you want even more information, the dropdown under each item will show the micronutrients. 

As you browse through the menu, you can build a meal by clicking the plus icon on any items (you can also remove the item by clicking the subtract icon). Your added items will appear in the My Meal sidebar, which you can open with the My Meal button at the top right of the website. At the top of the sidebar, your total macros, calories and micronutrients will be displayed with your items below it. 

There is also a macro calculator feature at the top of the app (highlighted in red) which will help you determine your macro goals depending on your information. This feature is built around the Mifflin-St jeor equation and research-based recommendations for protein, fat, and carb intake. It asks for age, sex, height, weight, activity level, and fitness goal. The calculator will output your maintenance calories and recommend grams for protein, fat, and carbs.

The app uses localStorage for speed and convenience. The menu and nutrition data are saved until midnight so that browsing remains fast even if HUDS temporarily loads slowly. Your Macro targets remain saved until the user recalculates them. This reset is necessary to make sure users always see the most accurate HUDS menu data. 

## Troubleshooting
- If menus fail to load, the backend server may not be running or port 3001 may be in use. Testing with “curl http://localhost:3001/api/health” helps confirm that the backend is responding. Port conflicts on macOS and Linux can be fixed with “lsof -i :3001” followed by killing the listed PID. Windows users can fix this with “netstat -ano | findstr :3001” and “taskkill /PID <PID> /F”.
- If you see “npm: command not found”, reinstall Node.js from the official website and restart your terminal. If port 5173 is taken, either kill the process or start the frontend on a different port using “npm run dev – –port 5174”.
- If menu items are not loading, it could be caused by HUDS site changes or network issues. 
- If nutrition values are missing or appear as N/A, it usually means the HUDS website did not provide that information. 
- If you get stuck on the loading screen, clear localStorage and refresh the page. 