import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, MapPin, Utensils, X, Plus, Minus, UtensilsCrossed, ChevronDown } from 'lucide-react'

// base url for api requests, uses environment variable in production or localhost in dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// keys used for local storage
const STORAGE_KEYS = {
  MENU_CACHE: 'harvardmacros_menu_cache',
  NUTRITION_CACHE: 'harvardmacros_nutrition_cache',
  SELECTED_ITEMS: 'harvardmacros_selected_items',
  CACHE_TIMESTAMP: 'harvardmacros_cache_timestamp'
}

// check if the cache is still valid for today
const isCacheValid = () => {
  const timestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP)
  if (!timestamp) return false
  
  const cacheDate = new Date(parseInt(timestamp))
  const now = new Date()
  
  // return true only if the date matches today
  return (
    cacheDate.getDate() === now.getDate() &&
    cacheDate.getMonth() === now.getMonth() &&
    cacheDate.getFullYear() === now.getFullYear()
  )
}

// remove expired cache at midnight
const clearExpiredCache = () => {
  if (!isCacheValid()) {
    localStorage.removeItem(STORAGE_KEYS.MENU_CACHE)
    localStorage.removeItem(STORAGE_KEYS.NUTRITION_CACHE)
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ITEMS) // also clear the cart
    localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString())
  }
}

// get menu data from cache for a specific location, meal, and date
const getCachedMenu = (location, meal, date) => {
  if (!isCacheValid()) return null
  
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU_CACHE) || '{}')
    const key = `${location}_${meal}_${date}`
    return cache[key] || null
  } catch {
    return null
  }
}

// save menu data to cache
const setCachedMenu = (location, meal, date, data) => {
  try {
    const cache = JSON.parse(localStorage.getItem(STORAGE_KEYS.MENU_CACHE) || '{}')
    const key = `${location}_${meal}_${date}`
    cache[key] = data
    localStorage.setItem(STORAGE_KEYS.MENU_CACHE, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to cache menu:', error)
  }
}

// get cached nutrition data
const getCachedNutrition = () => {
  if (!isCacheValid()) return {}
  
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NUTRITION_CACHE) || '{}')
  } catch {
    return {}
  }
}

// save nutrition cache
const setCachedNutrition = (cache) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NUTRITION_CACHE, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to cache nutrition:', error)
  }
}

// get saved items in the cart
const getSavedSelectedItems = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.SELECTED_ITEMS)
    
    if (!savedData) {
      return []
    }
    
    const saved = JSON.parse(savedData)
    
    // only return items if they are from today
    const timestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP)
    if (timestamp && isCacheValid()) {
      return saved
    }
    
    // if items are from a different day, clear them
    return []
  } catch (error) {
    console.error('Error loading cart:', error)
    return []
  }
}

// save selected items to local storage
const saveSelectedItems = (items) => {
  try {
    const data = JSON.stringify(items)
    localStorage.setItem(STORAGE_KEYS.SELECTED_ITEMS, data)
  } catch (error) {
    console.error('Failed to save selected items:', error)
  }
}

// get saved macro targets from previous calculator use
const getSavedMacroTargets = () => {
  try {
    const saved = localStorage.getItem('harvardmacros_macro_targets')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// save macro targets to local storage
const saveMacroTargets = (targets) => {
  try {
    localStorage.setItem('harvardmacros_macro_targets', JSON.stringify(targets))
  } catch (error) {
    console.error('Failed to save macro targets:', error)
  }
}

function NewMenu() {
  // state for locations and current selection
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('30')
  
  // auto select meal based on current time
  const [selectedMeal, setSelectedMeal] = useState(() => {
    const now = new Date()
    const hour = now.getHours()
    if (hour < 10) return 'breakfast'
    if (hour < 14) return 'lunch'
    return 'dinner'
  })

  // default to today's date
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const year = today.getFullYear()
    return `${month}/${day}/${year}`
  })

  // menu data and loading/error states
  const [menuData, setMenuData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadedFromCache, setLoadedFromCache] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // cart states
  const [selectedItems, setSelectedItems] = useState(() => {
    clearExpiredCache()
    if (!localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP)) {
      localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, Date.now().toString())
    }
    return getSavedSelectedItems()
  })
  const [cartOpen, setCartOpen] = useState(false)

  // expanded views for nutrition info
  const [expandedNutrition, setExpandedNutrition] = useState({})
  const [expandedMicronutrients, setExpandedMicronutrients] = useState({})
  
  // nutrition cache and loading state
  const [nutritionCache, setNutritionCache] = useState(() => getCachedNutrition())
  const [loadingNutrition, setLoadingNutrition] = useState(new Set())

  // loading screen states
  const [showLoadingScreen, setShowLoadingScreen] = useState(() => {
    return !sessionStorage.getItem('loadingScreenShown')
  })
  const [loadingScreenFadeOut, setLoadingScreenFadeOut] = useState(false)

  // sidebar and sidebar micro states
  const [sidebarClosing, setSidebarClosing] = useState(false)
  const [expandedSidebarMicros, setExpandedSidebarMicros] = useState(false)
  const [expandedSidebarItemMicros, setExpandedSidebarItemMicros] = useState({})

  // filter states
  const [filterVegan, setFilterVegan] = useState(false)
  const [filterVegetarian, setFilterVegetarian] = useState(false)
  const [filterHalal, setFilterHalal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // mobile dropdown states
  const [mobileLocationOpen, setMobileLocationOpen] = useState(false)
  const [mobileDateOpen, setMobileDateOpen] = useState(false)
  const [mobileMealOpen, setMobileMealOpen] = useState(false)

  // macro targets from calculator
  const [macroTargets, setMacroTargets] = useState(() => getSavedMacroTargets())

  // load initial data and handle loading screen
  useEffect(() => {
    fetchLocations()
    fetchMenu()
    
    if (showLoadingScreen) {
      // disable scrolling while loading screen is active
      document.body.style.overflow = 'hidden'
      sessionStorage.setItem('loadingScreenShown', 'true')
      
      // fade out the loading screen after 3.5 seconds
      const fadeTimer = setTimeout(() => setLoadingScreenFadeOut(true), 3500)
      const removeTimer = setTimeout(() => {
        setShowLoadingScreen(false)
        document.body.style.overflow = 'unset'
      }, 4000)
      
      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(removeTimer)
        document.body.style.overflow = 'unset'
      }
    }
  }, [])

  // refetch menu whenever selection changes
  useEffect(() => {
    if (selectedLocation) {
      fetchMenu()
    }
  }, [selectedLocation, selectedMeal, selectedDate])

  // clear selected items when changing location
  useEffect(() => {
    setSelectedItems([])
    saveSelectedItems([])
  }, [selectedLocation])

  // save cart to local storage whenever items change
  useEffect(() => {
    saveSelectedItems(selectedItems)
  }, [selectedItems])

  // save nutrition cache to local storage whenever it changes
  useEffect(() => {
    setCachedNutrition(nutritionCache)
  }, [nutritionCache])

  // preload all nutrition info when menu data is loaded
  useEffect(() => {
    if (menuData?.categories) {
      preloadAllNutrition()
    }
  }, [menuData])

  // fetch nutrition for all items in batches to avoid overloading server
  const preloadAllNutrition = async () => {
    const allItems = []
    Object.entries(menuData.categories).forEach(([category, items]) => {
      items.forEach((item) => {
        allItems.push({ category, item })
      })
    })

    const batchSize = 5
    for (let i = 0; i < allItems.length; i += batchSize) {
      const batch = allItems.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async ({ category, item }) => {
          const itemKey = `${category}-${item.name}`
          if (!nutritionCache[itemKey]) {
            await fetchNutrition(itemKey, item.name)
          }
        })
      )
    }
  }

  // fetch available locations from api
  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/locations`)
      const data = await response.json()
      const locationsArray = Object.values(data)
      setLocations(locationsArray)
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  // fetch menu data, checking cache first
  const fetchMenu = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const cachedData = getCachedMenu(selectedLocation, selectedMeal, selectedDate)
      if (cachedData) {
        setMenuData(cachedData)
        setLoadedFromCache(true)
        setLoading(false)
        return
      }
      
      setLoadedFromCache(false)
      const dateParam = selectedDate.replace(/\//g, '%2f')
      const response = await fetch(
        `${API_URL}/api/menu?location=${selectedLocation}&meal=${selectedMeal}&date=${dateParam}`
      )
      const data = await response.json()
      setCachedMenu(selectedLocation, selectedMeal, selectedDate, data)
      setMenuData(data)
    } catch (err) {
      setError('Failed to load menu. Make sure the server is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // fetch nutrition for a single item if not cached
  const fetchNutrition = async (itemKey, itemName) => {
    if (nutritionCache[itemKey]) return

    setLoadingNutrition((prev) => new Set(prev).add(itemKey))

    try {
      const dateParam = selectedDate.replace(/\//g, '%2f')
      const response = await fetch(
        `${API_URL}/api/nutrition/item?location=${selectedLocation}&date=${dateParam}&meal=${selectedMeal}&name=${encodeURIComponent(
          itemName
        )}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch nutrition data')
      }

      const data = await response.json()
      setNutritionCache((prev) => ({ ...prev, [itemKey]: data }))
    } catch (err) {
      console.error(`Error fetching nutrition for "${itemName}":`, err)
      setNutritionCache((prev) => ({
        ...prev,
        [itemKey]: { error: err.message || 'Failed to load nutrition data' },
      }))
    } finally {
      setLoadingNutrition((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemKey)
        return newSet
      })
    }
  }

  // toggle expanded view for nutrition info
  const toggleNutrition = async (category, itemName) => {
    const itemKey = `${category}-${itemName}`
    const isCurrentlyExpanded = expandedNutrition[itemKey]

    setExpandedNutrition((prev) => ({
      ...prev,
      [itemKey]: !isCurrentlyExpanded,
    }))

    if (!isCurrentlyExpanded && !nutritionCache[itemKey]) {
      await fetchNutrition(itemKey, itemName)
    }
  }

  // toggle expanded view for micronutrients
  const toggleMicronutrients = (category, itemName) => {
    const itemKey = `${category}-${itemName}`
    setExpandedMicronutrients((prev) => ({
      ...prev,
      [itemKey]: !prev[itemKey],
    }))
  }

  // close sidebar and re-enable scrolling
  const handleCloseSidebar = () => {
    setSidebarClosing(true)
    setTimeout(() => {
      setCartOpen(false)
      setSidebarClosing(false)
      document.body.style.overflow = 'unset'
    }, 300)
  }

  // prevent scrolling when sidebar is open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [cartOpen])

  // close mobile dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.mobile-dropdown')) {
        setMobileLocationOpen(false)
        setMobileDateOpen(false)
        setMobileMealOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // add item to cart
  const handleAddToMeal = (item, category) => {
    const existingIndex = selectedItems.findIndex(
      (selected) => selected.item.name === item.name && selected.category === category
    )

    if (existingIndex !== -1) {
      const newItems = [...selectedItems]
      newItems[existingIndex].quantity += 1
      setSelectedItems(newItems)
    } else {
      setSelectedItems([...selectedItems, { item, category, quantity: 1 }])
    }
  }

  // remove item from cart
  const handleRemoveFromMeal = (item, category) => {
    const existingIndex = selectedItems.findIndex(
      (selected) => selected.item.name === item.name && selected.category === category
    )

    if (existingIndex !== -1) {
      const newItems = [...selectedItems]
      if (newItems[existingIndex].quantity > 1) {
        newItems[existingIndex].quantity -= 1
      } else {
        newItems.splice(existingIndex, 1)
      }
      setSelectedItems(newItems)
    }
  }

  // get quantity of a specific item in the cart
  const getItemQuantity = (itemName, category) => {
    const found = selectedItems.find((selected) => selected.item.name === itemName && selected.category === category)
    return found ? found.quantity : 0
  }

  // total number of items in cart
  const totalItemCount = selectedItems.reduce((sum, { quantity }) => sum + quantity, 0)

  // calculate total macros for selected items
  const totalMacros = selectedItems.reduce(
    (acc, { item, category, quantity }) => {
      const itemKey = `${category}-${item.name}`
      const nutrition = nutritionCache[itemKey]

      if (nutrition && !nutrition.error) {
        return {
          calories: acc.calories + (nutrition.calories || 0) * quantity,
          protein: acc.protein + (nutrition.macros?.protein || 0) * quantity,
          carbs: acc.carbs + (nutrition.macros?.carbs || 0) * quantity,
          fat: acc.fat + (nutrition.macros?.fat || 0) * quantity,
        }
      }
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  // calculate total micronutrients for selected items
  const totalMicronutrients = selectedItems.reduce(
    (acc, { item, category, quantity }) => {
      const itemKey = `${category}-${item.name}`
      const nutrition = nutritionCache[itemKey]

      if (nutrition && !nutrition.error) {
        return {
          saturatedFat: acc.saturatedFat + (nutrition.macros?.saturatedFat || 0) * quantity,
          transFat: acc.transFat + (nutrition.macros?.transFat || 0) * quantity,
          fiber: acc.fiber + (nutrition.macros?.fiber || 0) * quantity,
          sugar: acc.sugar + (nutrition.macros?.sugar || 0) * quantity,
          addedSugar: acc.addedSugar + (nutrition.macros?.addedSugar || 0) * quantity,
          cholesterol: acc.cholesterol + (nutrition.micronutrients?.cholesterol || 0) * quantity,
          sodium: acc.sodium + (nutrition.micronutrients?.sodium || 0) * quantity,
          potassium: acc.potassium + (nutrition.micronutrients?.potassium || 0) * quantity,
          calcium: acc.calcium + (nutrition.micronutrients?.calcium || 0) * quantity,
          iron: acc.iron + (nutrition.micronutrients?.iron || 0) * quantity,
          vitaminD: acc.vitaminD + (nutrition.micronutrients?.vitaminD || 0) * quantity,
        }
      }
      return acc
    },
    { saturatedFat: 0, transFat: 0, fiber: 0, sugar: 0, addedSugar: 0, cholesterol: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0, vitaminD: 0 }
  )

  // Log state data structures
  // Generate available dates (today + 6 days)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const year = date.getFullYear()
      
      dates.push({
        value: `${month}/${day}/${year}`,
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
    
    return dates
  }

  // Get meal time based on location and meal type
  const getMealTime = () => {
    const isAnnenberg = selectedLocation === '30' // Annenberg location ID
    
    if (selectedMeal === 'breakfast') {
      return '7:30AM - 10:30AM'
    } else if (selectedMeal === 'lunch') {
      return '11:30AM - 2:00PM'
    } else if (selectedMeal === 'dinner') {
      return isAnnenberg ? '4:30PM - 7:30PM' : '5:00PM - 7:30PM'
    }
    return ''
  }

  const filteredCategories = menuData?.categories
    ? Object.entries(menuData.categories).reduce((acc, [category, items]) => {
        // If a category is selected, only show that category
        if (selectedCategory && category !== selectedCategory) {
          return acc
        }
        
        const filtered = items.filter((item) => {
          if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
          if (filterVegan && !item.vegan) return false
          if (filterVegetarian && !item.vegetarian) return false
          // For Halal filter: show items with halal tag OR all items from "Halal" category
          if (filterHalal && !item.halal && !category.toLowerCase().includes('halal')) return false
          return true
        })
        if (filtered.length > 0) {
          acc[category] = filtered
        }
        return acc
      }, {})
    : {}

  // Get all available categories for the category filter
  const availableCategories = menuData?.categories ? Object.keys(menuData.categories) : []

  return (
    <>
      {/* Loading Screen */}
      {showLoadingScreen && (
        <div className={`fixed inset-0 z-[100] bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center ${loadingScreenFadeOut ? 'loading-screen-exit' : ''}`}>
          <div className="relative flex items-center justify-center">
            {/* Animated Circle - larger than logo */}
            <div className="absolute">
              <div className="w-64 h-64 rounded-full border-[6px] border-transparent border-t-white border-r-white border-b-white animate-slow-spin" style={{ borderTopColor: 'white', borderRightColor: 'white', borderBottomColor: 'white', borderLeftColor: 'transparent' }}></div>
            </div>
            {/* Logo - centered with slight downward adjustment */}
            <img
              src="/harvardmacros.png"
              alt="Harvard Macros Logo"
              className="h-40 w-30 relative z-10 mt-1"
            />
          </div>
        </div>
      )}

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-primary-700 shadow-lg">
        <div className="container mx-auto px-4 py-3 md:py-4">
          {/* Desktop Header */}
          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-3">
                <img
                src="/harvardmacros.png"
                alt="Harvard Macros Logo"
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">Harvard Macros</h1>
                  <p className="text-sm text-white/90">Tracking Made Easy</p>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 text-white px-3 py-2 rounded-lg">
                <MapPin className="h-4 w-4" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent border-none outline-none text-white cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc.locationNum} value={loc.locationNum} className="text-gray-900">
                      {loc.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 text-white px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4" />
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-white cursor-pointer"
                >
                  {getAvailableDates().map((date) => (
                    <option key={date.value} value={date.value} className="text-gray-900">
                      {date.display}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 text-white px-3 py-2 rounded-lg">
                <Utensils className="h-4 w-4" />
                <select
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                  className="bg-transparent border-none outline-none text-white cursor-pointer capitalize"
                >
                  <option value="breakfast" className="text-gray-900">
                    Breakfast
                  </option>
                  <option value="lunch" className="text-gray-900">
                    Lunch
                  </option>
                  <option value="dinner" className="text-gray-900">
                    Dinner
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/10 text-white px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">{getMealTime()}</span>
              </div>
              </div>

              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 bg-white text-primary-700 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors shadow-md"
              >
                <UtensilsCrossed className="h-5 w-5" />
                My Meal
                {totalItemCount > 0 && (
                  <span className="bg-primary-700 text-white px-2 py-0.5 rounded-full text-sm">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/harvardmacros.png"
                  alt="Harvard Macros Logo"
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">Harvard Macros</h1>
                  <p className="text-xs text-white/90">Tracking Made Easy</p>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(true)}
                className="relative bg-white text-primary-700 p-2 rounded-lg"
              >
                <UtensilsCrossed className="h-5 w-5" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-700 text-white px-1.5 py-0.5 rounded-full text-xs">
                    {totalItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Macro Calculator CTA */}
        <div className="mb-6 bg-gradient-to-r from-primary-100 to-primary-50 border-2 border-primary-700 rounded-lg p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-primary-700 mb-2">
                Need Help Planning Your Meals?
              </h2>
              <p className="text-gray-700">Calculate your personalized macro targets based on your fitness goals</p>
            </div>
            <Link
              to="/calculator"
              className="bg-primary-700 hover:bg-primary-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md whitespace-nowrap"
            >
              Calculate My Macros
            </Link>
          </div>
        </div>

        {/* Mobile Menu Card - Only on Mobile */}
        <div className="md:hidden mb-6 bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <h3 className="text-lg font-bold text-primary-700 mb-4">Menu Options</h3>
          <div className="space-y-4">
            {/* Location Dropdown */}
            <div className="relative mobile-dropdown">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <button
                onClick={() => {
                  setMobileLocationOpen(!mobileLocationOpen)
                  setMobileDateOpen(false)
                  setMobileMealOpen(false)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white flex items-center justify-between"
              >
                <span>{locations.find(loc => loc.locationNum === selectedLocation)?.displayName || 'Select Location'}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${mobileLocationOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileLocationOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locations.map((loc) => (
                    <button
                      key={loc.locationNum}
                      onClick={() => {
                        setSelectedLocation(loc.locationNum)
                        setMobileLocationOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                        selectedLocation === loc.locationNum ? 'bg-primary-50 text-primary-700 font-medium' : ''
                      }`}
                    >
                      {loc.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Dropdown */}
            <div className="relative mobile-dropdown">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <button
                onClick={() => {
                  setMobileDateOpen(!mobileDateOpen)
                  setMobileLocationOpen(false)
                  setMobileMealOpen(false)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white flex items-center justify-between"
              >
                <span>{getAvailableDates().find(date => date.value === selectedDate)?.display || 'Select Date'}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${mobileDateOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileDateOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {getAvailableDates().map((date) => (
                    <button
                      key={date.value}
                      onClick={() => {
                        setSelectedDate(date.value)
                        setMobileDateOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${
                        selectedDate === date.value ? 'bg-primary-50 text-primary-700 font-medium' : ''
                      }`}
                    >
                      {date.display}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Meal Dropdown */}
            <div className="relative mobile-dropdown">
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal</label>
              <button
                onClick={() => {
                  setMobileMealOpen(!mobileMealOpen)
                  setMobileLocationOpen(false)
                  setMobileDateOpen(false)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white flex items-center justify-between capitalize"
              >
                <span>{selectedMeal}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${mobileMealOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileMealOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {['breakfast', 'lunch', 'dinner'].map((meal) => (
                    <button
                      key={meal}
                      onClick={() => {
                        setSelectedMeal(meal)
                        setMobileMealOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 capitalize ${
                        selectedMeal === meal ? 'bg-primary-50 text-primary-700 font-medium' : ''
                      }`}
                    >
                      {meal}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{getMealTime()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Category Filters */}
          {availableCategories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
              <div className="flex gap-2 flex-wrap">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-700 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
          </div>
            </div>
          )}

          {/* Dietary Filters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Dietary Filters</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterVegan(!filterVegan)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVegan
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Vegan
            </button>
            <button
              onClick={() => setFilterVegetarian(!filterVegetarian)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterVegetarian
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Vegetarian
            </button>
            <button
              onClick={() => setFilterHalal(!filterHalal)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterHalal
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Halal
            </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            <p className="mt-4 text-gray-600">Loading menu...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={fetchMenu}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(filteredCategories).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-primary-700 mb-4 border-b-2 border-primary-200 pb-2">
                  {category}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  {items.map((item, index) => {
                    const itemKey = `${category}-${item.name}`
                    const isExpanded = expandedNutrition[itemKey]
                    const nutrition = nutritionCache[itemKey]
                    const isLoading = loadingNutrition.has(itemKey)
                    const quantity = getItemQuantity(item.name, category)

                    return (
                      <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="p-4">
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight mb-1">
                                {item.name}
                              </h3>
                              {nutrition && !nutrition.error && nutrition.servingSize && (
                                <p className="text-xs text-gray-500">
                                  <span className="font-medium">Serving:</span> {nutrition.servingSize}
                                </p>
                              )}
                              {!isExpanded && isLoading && (
                                <p className="text-xs text-gray-500 mt-1">Loading nutrition...</p>
                              )}
                            </div>

                            {quantity > 0 ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleRemoveFromMeal(item, category)}
                                  className="p-1 border-2 border-primary-700 text-primary-700 rounded-md hover:bg-primary-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-semibold text-sm w-8 text-center">{quantity}</span>
                                <button
                                  onClick={() => handleAddToMeal(item, category)}
                                  className="p-1 bg-primary-700 text-white rounded-md hover:bg-primary-800"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToMeal(item, category)}
                                className="shrink-0 p-1 bg-primary-700 text-white rounded-md hover:bg-primary-800"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.vegan && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">
                                Vegan
                              </span>
                            )}
                            {item.vegetarian && !item.vegan && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                Vegetarian
                              </span>
                            )}
                            {item.halal && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                                Halal
                              </span>
                            )}
                          </div>

                          {/* Quick Nutrition Preview (when not expanded) */}
                          {!isExpanded && nutrition && !nutrition.error && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="grid grid-cols-4 gap-2 mb-3">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Calories</p>
                                  <p className="font-bold text-base text-gray-900">{nutrition.calories}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Protein</p>
                                  <p className="font-bold text-base text-gray-900">{nutrition.macros?.protein || 0}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Carbs</p>
                                  <p className="font-bold text-base text-gray-900">{nutrition.macros?.carbs || 0}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">Fat</p>
                                  <p className="font-bold text-base text-gray-900">{nutrition.macros?.fat || 0}g</p>
                                </div>
                              </div>
                              
                              {/* Micronutrients Dropdown */}
                              <div>
                                <button
                                  onClick={() => toggleMicronutrients(category, item.name)}
                                  className="w-full py-1.5 px-2 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-200 transition-colors flex items-center justify-between"
                                >
                                  <span>View Micronutrients</span>
                                  <span className="text-xs">{expandedMicronutrients[`${category}-${item.name}`] ? '▲' : '▼'}</span>
                                </button>
                                
                                {expandedMicronutrients[`${category}-${item.name}`] && (
                                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {/* Row 1 */}
                                      <div>
                                        <p className="text-gray-500">Saturated Fat</p>
                                        <p className="font-semibold">{nutrition.macros?.saturatedFat || 0}g</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Trans Fat</p>
                                        <p className="font-semibold">{nutrition.macros?.transFat || 0}g</p>
                                      </div>
                                      
                                      {/* Row 2 */}
                                      <div>
                                        <p className="text-gray-500">Cholesterol</p>
                                        <p className="font-semibold">{nutrition.micronutrients?.cholesterol || 0}mg</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Sodium</p>
                                        <p className="font-semibold">{nutrition.micronutrients?.sodium || 0}mg</p>
                                      </div>
                                      
                                      {/* Row 3 */}
                                      <div>
                                        <p className="text-gray-500">Fiber</p>
                                        <p className="font-semibold">{nutrition.macros?.fiber || 0}g</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Sugar</p>
                                        <p className="font-semibold">{nutrition.macros?.sugar || 0}g</p>
                                      </div>
                                      
                                      {/* Row 4 */}
                                      <div>
                                        <p className="text-gray-500">Added Sugar</p>
                                        <p className="font-semibold">{nutrition.macros?.addedSugar || 0}g</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Iron</p>
                                        <p className="font-semibold">{nutrition.micronutrients?.iron || 0}mg</p>
                                      </div>
                                      
                                      {/* Row 5 */}
                                      <div>
                                        <p className="text-gray-500">Potassium</p>
                                        <p className="font-semibold">{nutrition.micronutrients?.potassium || 0}mg</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Calcium</p>
                                        <p className="font-semibold">{nutrition.micronutrients?.calcium || 0}mg</p>
                                      </div>
                                      
                                      {/* Row 6 */}
                                      <div>
                                        <p className="text-gray-500">Vitamin D</p>
                                        <p className="font-semibold">{nutrition.micronutrients?.vitaminD || 0}mcg</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Expanded Nutrition */}
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {isLoading ? (
                                <div className="text-center py-4">
                                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-700"></div>
                                  <p className="text-xs text-gray-500 mt-2">Loading nutrition...</p>
                                </div>
                              ) : nutrition?.error ? (
                                <div className="text-center py-2">
                                  <p className="text-xs text-red-600">{nutrition.error}</p>
                                </div>
                              ) : nutrition ? (
                                <div>
                                  <div className="grid grid-cols-4 gap-2 mb-3">
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Cal</p>
                                      <p className="font-bold text-sm">{nutrition.calories}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-blue-600">Protein</p>
                                      <p className="font-bold text-sm text-blue-600">
                                        {nutrition.macros?.protein || 0}g
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-orange-600">Carbs</p>
                                      <p className="font-bold text-sm text-orange-600">
                                        {nutrition.macros?.carbs || 0}g
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-yellow-600">Fat</p>
                                      <p className="font-bold text-sm text-yellow-600">
                                        {nutrition.macros?.fat || 0}g
                                      </p>
                                    </div>
                                  </div>
                                  {nutrition.servingSize && (
                                    <p className="text-xs text-gray-500 text-center mb-2">
                                      Serving: {nutrition.servingSize}
                                    </p>
                                  )}
                                  
                                  {/* Micronutrients Dropdown */}
                                  <div className="mb-2">
                                    <button
                                      onClick={() => toggleMicronutrients(category, item.name)}
                                      className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-between"
                                    >
                                      <span>View Micronutrients</span>
                                      <span>{expandedMicronutrients[`${category}-${item.name}`] ? '▲' : '▼'}</span>
                                    </button>
                                    
                                    {expandedMicronutrients[`${category}-${item.name}`] && (
                                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                          {/* Row 1 */}
                                          <div>
                                            <p className="text-gray-500">Saturated Fat</p>
                                            <p className="font-semibold">{nutrition.macros?.saturatedFat || 0}g</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Trans Fat</p>
                                            <p className="font-semibold">{nutrition.macros?.transFat || 0}g</p>
                                          </div>
                                          
                                          {/* Row 2 */}
                                          <div>
                                            <p className="text-gray-500">Cholesterol</p>
                                            <p className="font-semibold">{nutrition.micronutrients?.cholesterol || 0}mg</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Sodium</p>
                                            <p className="font-semibold">{nutrition.micronutrients?.sodium || 0}mg</p>
                                          </div>
                                          
                                          {/* Row 3 */}
                                          <div>
                                            <p className="text-gray-500">Fiber</p>
                                            <p className="font-semibold">{nutrition.macros?.fiber || 0}g</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Sugar</p>
                                            <p className="font-semibold">{nutrition.macros?.sugar || 0}g</p>
                                          </div>
                                          
                                          {/* Row 4 */}
                                          <div>
                                            <p className="text-gray-500">Added Sugar</p>
                                            <p className="font-semibold">{nutrition.macros?.addedSugar || 0}g</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Iron</p>
                                            <p className="font-semibold">{nutrition.micronutrients?.iron || 0}mg</p>
                                          </div>
                                          
                                          {/* Row 5 */}
                                          <div>
                                            <p className="text-gray-500">Potassium</p>
                                            <p className="font-semibold">{nutrition.micronutrients?.potassium || 0}mg</p>
                                          </div>
                                          <div>
                                            <p className="text-gray-500">Calcium</p>
                                            <p className="font-semibold">{nutrition.micronutrients?.calcium || 0}mg</p>
                                          </div>
                                          
                                          {/* Row 6 */}
                                          <div>
                                            <p className="text-gray-500">Vitamin D</p>
                                            <p className="font-semibold">{nutrition.micronutrients?.vitaminD || 0}mcg</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <button
                                    onClick={() => toggleNutrition(category, item.name)}
                                    className="w-full text-xs text-primary-600 hover:text-primary-800 font-medium"
                                  >
                                    Hide Nutrition ↑
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {Object.keys(filteredCategories).length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No items found</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Shopping Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" onClick={handleCloseSidebar}></div>
          <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg border-l border-gray-200 ${sidebarClosing ? 'sidebar-slide-out' : 'sidebar-slide-in'}`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-primary-700">Your Meal</h2>
                <button onClick={handleCloseSidebar} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Macro Targets Section */}
              {macroTargets && (
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-b-2 border-primary-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-primary-800">Your Daily Targets</h3>
                    <Link
                      to="/calculator"
                      onClick={() => setCartOpen(false)}
                      className="text-xs text-primary-700 hover:text-primary-900 font-medium underline"
                    >
                      Update
                    </Link>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white/70 rounded p-2">
                      <div className="text-lg font-bold text-primary-800">{macroTargets.calories}</div>
                      <div className="text-xs text-primary-700">Cal</div>
                    </div>
                    <div className="bg-white/70 rounded p-2">
                      <div className="text-lg font-bold text-primary-800">{macroTargets.protein}g</div>
                      <div className="text-xs text-primary-700">Protein</div>
                    </div>
                    <div className="bg-white/70 rounded p-2">
                      <div className="text-lg font-bold text-primary-800">{macroTargets.carbs}g</div>
                      <div className="text-xs text-primary-700">Carbs</div>
                    </div>
                    <div className="bg-white/70 rounded p-2">
                      <div className="text-lg font-bold text-primary-800">{macroTargets.fat}g</div>
                      <div className="text-xs text-primary-700">Fat</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Add items to build your meal</p>
                </div>
              ) : (
                <>
                  {/* Macro Totals */}
                  <div className="p-4 bg-primary-700 text-white">
                    <div className="text-sm font-medium mb-3">Total Macros</div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-2xl font-bold">{Math.round(totalMacros.calories)}</div>
                        <div className="text-xs opacity-90">Calories</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{Math.round(totalMacros.protein)}g</div>
                        <div className="text-xs opacity-90">Protein</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{Math.round(totalMacros.carbs)}g</div>
                        <div className="text-xs opacity-90">Carbs</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{Math.round(totalMacros.fat)}g</div>
                        <div className="text-xs opacity-90">Fat</div>
                      </div>
                    </div>
                    
                    {/* Micronutrients Dropdown */}
                    <button
                      onClick={() => setExpandedSidebarMicros(!expandedSidebarMicros)}
                      className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded transition-colors flex items-center justify-between"
                    >
                      <span>View Total Micronutrients</span>
                      <span className="text-xs">{expandedSidebarMicros ? '▲' : '▼'}</span>
                    </button>
                    
                    {expandedSidebarMicros && (
                      <div className="mt-3 p-3 bg-white/10 rounded">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="opacity-75">Saturated Fat</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.saturatedFat * 10) / 10}g</p>
                          </div>
                          <div>
                            <p className="opacity-75">Trans Fat</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.transFat * 10) / 10}g</p>
                          </div>
                          <div>
                            <p className="opacity-75">Cholesterol</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.cholesterol)}mg</p>
                          </div>
                          <div>
                            <p className="opacity-75">Sodium</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.sodium)}mg</p>
                          </div>
                          <div>
                            <p className="opacity-75">Fiber</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.fiber * 10) / 10}g</p>
                          </div>
                          <div>
                            <p className="opacity-75">Sugar</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.sugar * 10) / 10}g</p>
                          </div>
                          <div>
                            <p className="opacity-75">Added Sugar</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.addedSugar * 10) / 10}g</p>
                          </div>
                          <div>
                            <p className="opacity-75">Iron</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.iron * 10) / 10}mg</p>
                          </div>
                          <div>
                            <p className="opacity-75">Potassium</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.potassium)}mg</p>
                          </div>
                          <div>
                            <p className="opacity-75">Calcium</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.calcium)}mg</p>
                          </div>
                          <div>
                            <p className="opacity-75">Vitamin D</p>
                            <p className="font-semibold">{Math.round(totalMicronutrients.vitaminD * 10) / 10}mcg</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Item List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                    {selectedItems.map(({ item, category, quantity }, index) => {
                      const itemKey = `${category}-${item.name}`
                      const nutrition = nutritionCache[itemKey]
                      const isItemMicrosExpanded = expandedSidebarItemMicros[`sidebar-${itemKey}`]
                      
                      return (
                        <div key={index} className="p-3 rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{category}</div>
                        </div>
                            <div className="flex items-center gap-1 shrink-0">
                        <button
                                onClick={() => handleRemoveFromMeal(item, category)}
                                className="p-1 border-2 border-primary-700 text-primary-700 rounded-md hover:bg-primary-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="font-semibold text-sm w-8 text-center">{quantity}</span>
                              <button
                                onClick={() => handleAddToMeal(item, category)}
                                className="p-1 bg-primary-700 text-white rounded-md hover:bg-primary-800"
                              >
                                <Plus className="h-4 w-4" />
                        </button>
                      </div>
                  </div>

                          {/* Main Macros */}
                          {nutrition && !nutrition.error && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="grid grid-cols-4 gap-1 text-xs mb-2">
                                <div className="text-center">
                                  <p className="text-gray-500">Cal</p>
                                  <p className="font-bold">{Math.round(nutrition.calories * quantity)}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500">Protein</p>
                                  <p className="font-bold">{Math.round((nutrition.macros?.protein || 0) * quantity)}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500">Carbs</p>
                                  <p className="font-bold">{Math.round((nutrition.macros?.carbs || 0) * quantity)}g</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-500">Fat</p>
                                  <p className="font-bold">{Math.round((nutrition.macros?.fat || 0) * quantity)}g</p>
                                </div>
                              </div>
                              
                              {/* Micronutrients Dropdown */}
                    <button
                                onClick={() => setExpandedSidebarItemMicros(prev => ({
                                  ...prev,
                                  [`sidebar-${itemKey}`]: !prev[`sidebar-${itemKey}`]
                                }))}
                                className="w-full py-1.5 px-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200 transition-colors flex items-center justify-between"
                              >
                                <span>View Micronutrients</span>
                                <span className="text-xs">{isItemMicrosExpanded ? '▲' : '▼'}</span>
                    </button>
                              
                              {isItemMicrosExpanded && (
                                <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <p className="text-gray-500">Saturated Fat</p>
                                      <p className="font-semibold">{Math.round((nutrition.macros?.saturatedFat || 0) * quantity * 10) / 10}g</p>
                  </div>
                                    <div>
                                      <p className="text-gray-500">Trans Fat</p>
                                      <p className="font-semibold">{Math.round((nutrition.macros?.transFat || 0) * quantity * 10) / 10}g</p>
            </div>
                                    <div>
                                      <p className="text-gray-500">Cholesterol</p>
                                      <p className="font-semibold">{Math.round((nutrition.micronutrients?.cholesterol || 0) * quantity)}mg</p>
          </div>
                                    <div>
                                      <p className="text-gray-500">Sodium</p>
                                      <p className="font-semibold">{Math.round((nutrition.micronutrients?.sodium || 0) * quantity)}mg</p>
        </div>
                                    <div>
                                      <p className="text-gray-500">Fiber</p>
                                      <p className="font-semibold">{Math.round((nutrition.macros?.fiber || 0) * quantity * 10) / 10}g</p>
              </div>
                <div>
                                      <p className="text-gray-500">Sugar</p>
                                      <p className="font-semibold">{Math.round((nutrition.macros?.sugar || 0) * quantity * 10) / 10}g</p>
                </div>
                <div>
                                      <p className="text-gray-500">Added Sugar</p>
                                      <p className="font-semibold">{Math.round((nutrition.macros?.addedSugar || 0) * quantity * 10) / 10}g</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Iron</p>
                                      <p className="font-semibold">{Math.round((nutrition.micronutrients?.iron || 0) * quantity * 10) / 10}mg</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Potassium</p>
                                      <p className="font-semibold">{Math.round((nutrition.micronutrients?.potassium || 0) * quantity)}mg</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Calcium</p>
                                      <p className="font-semibold">{Math.round((nutrition.micronutrients?.calcium || 0) * quantity)}mg</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Vitamin D</p>
                                      <p className="font-semibold">{Math.round((nutrition.micronutrients?.vitaminD || 0) * quantity * 10) / 10}mcg</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>

                  {/* Clear All Button */}
                  <div className="p-4 border-t">
                    <button
                      onClick={() => setSelectedItems([])}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Footer */}
      <footer className="mt-12 border-t bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold">*CONSUMER RESPONSIBILITY*</span> Ingredients and nutritional content may
            vary. Manufacturers may change their product formulation or consistency of ingredients without our
            knowledge, and product availability may fluctuate. While we make every effort to identify ingredients, we
            cannot assure against these contingencies. Therefore, it is ultimately the responsibility of the consumer
            to judge whether or not to question ingredients or choose to eat selected foods. Food-allergic guests and
            those with specific concerns should speak with a manager for individualized assistance.
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}

export default NewMenu

