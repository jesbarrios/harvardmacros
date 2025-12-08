import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function MacroCalculator() {
  const [age, setAge] = useState('')
  const [sex, setSex] = useState('m')
  const [weight, setWeight] = useState('')
  const [feet, setFeet] = useState('')
  const [inches, setInches] = useState('')
  const [activity, setActivity] = useState('1.2')
  const [goal, setGoal] = useState('maintain')
  const [heightUnit, setHeightUnit] = useState('imperial') // imperial or metric
  const [heightCm, setHeightCm] = useState('')
  const [result, setResult] = useState(null)
  const [showForm, setShowForm] = useState(true)

  const handleSubmit = (e) => {
    e.preventDefault()

    // validate inputs
    const weightLb = parseFloat(weight)
    const ageNum = parseFloat(age)
    const feetNum = parseFloat(feet)
    const inchesNum = parseFloat(inches)

    if (ageNum < 10 || ageNum > 100) {
      alert('Age must be between 10 and 100')
      return
    }
    if (weightLb < 30 || weightLb > 600) {
      alert('Weight must be between 30 and 600 lb')
      return
    }

    // calculate height in cm
    let cm
    if (heightUnit === 'metric') {
      cm = parseFloat(heightCm)
      if (!cm || cm < 100 || cm > 250) {
        alert('Height must be between 100 and 250 cm')
        return
      }
    } else {
      cm = (feetNum * 12 + inchesNum) * 2.54
    }
    
    const weightKg = weightLb * 0.453592

    // calculate BMR using the Mifflin-St Jeor equation
    let BMR
    if (sex === 'm') {
      BMR = 10 * weightKg + 6.25 * cm - 5 * ageNum + 5
    } else {
      BMR = 10 * weightKg + 6.25 * cm - 5 * ageNum - 161
    }

    // calculate daily maintenance (TDEE) using BMR and activity level ratio
    const TDEE = BMR * parseFloat(activity)

    // calculate BMI
    const heightM = cm / 100
    const BMI = weightKg / (heightM ** 2)

    // ddjust calories and protein based on goal (supported by current data)
    let calories, proteinPerLb
    
    if (goal === 'deficit' || goal === 'cut' || goal === 'weight_loss') {
      calories = TDEE * 0.85  // 15% deficit
      proteinPerLb = 1.1  // greater value to preserve muscle while cutting
    } else if (goal === 'bulk' || goal === 'surplus') {
      calories = TDEE * 1.15  // 15% surplus for bulking (average common amount)
      proteinPerLb = BMI < 25 ? 0.9 : 0.8  // moderate protein, upped 0.9 in case of low BMIs to mitigate underestimation
    } else {  // maintenance
      calories = TDEE
      proteinPerLb = 0.8  // research guestimated usual
    }

    const protein = proteinPerLb * weightLb

    // calculate fat (minimum healthy fat)
    // - ≥0.25 g/lb
    // - ≥20% of total calories, which is pretty constant among all goals
    const fatMinWeight = 0.25 * weightLb
    const fatMinCal = (0.20 * calories) / 9
    const fat = Math.max(fatMinWeight, fatMinCal)

    // calculate carbs from remaining calories (so cutters don't carb load)
    const remainingCal = calories - (protein * 4) - (fat * 9)
    const carbs = Math.max(remainingCal / 4, 30)  // dont go below 30g

    const macroTargets = {
      maintenance: Math.round(TDEE),
      calories: Math.round(calories),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
    }
    
    setResult(macroTargets)
    
    // save to localStorage for use in Menu page
    try {
      localStorage.setItem('harvardmacros_macro_targets', JSON.stringify(macroTargets))
    } catch (error) {
      console.error('Failed to save macro targets:', error)
    }
    
    // Hide form and show results
    setShowForm(false)
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  {/* header at the top, stays sticky when scrolling */}
  <header className="sticky top-0 z-50 border-b bg-primary-700 shadow-lg">
    <div className="container mx-auto px-4 py-3 md:py-4">
      <div className="flex items-center gap-3 md:gap-4">
        <img
          src="/harvardmacros.png"
          alt="Harvard Macros Logo"
          className="h-8 w-auto md:h-12"
        />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Harvard Macros</h1>
          <p className="text-xs md:text-sm text-white/90">tracking made easy</p>
        </div>
      </div>
    </div>
  </header>

  <main className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
    <Link to="/menu">
      <button className="mb-4 flex items-center gap-2 text-primary-700 hover:text-primary-800 font-medium">
        <ArrowLeft className="h-4 w-4" />
        back to menu
      </button>
    </Link>

    {/* show results at the top if we have them and form is hidden */}
    {result && !showForm && (
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
        <div className="space-y-4">
          {/* maintenance calories section */}
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">maintenance calories (tdee)</span>
              <span className="text-xl font-bold text-gray-900">{result.maintenance} cal</span>
            </div>
          </div>

          {/* your daily macro targets */}
          <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-2 border-primary-700">
            <h3 className="text-xl font-semibold mb-4 text-primary-700">your daily macro targets</h3>
            
            {/* total calories displayed prominently */}
            <div className="mb-4 text-center p-5 bg-white rounded-lg shadow-md">
              <p className="text-4xl font-bold text-primary-700">{result.calories}</p>
              <p className="text-sm text-gray-600 mt-1">daily calories</p>
            </div>

            {/* macros split into a grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-black">{result.protein}g</p>
                <p className="text-xs text-gray-600 mt-1">protein</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-black">{result.carbs}g</p>
                <p className="text-xs text-gray-600 mt-1">carbs</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-black">{result.fat}g</p>
                <p className="text-xs text-gray-600 mt-1">fat</p>
              </div>
            </div>

            {/* macro percentages */}
            <div className="mt-4 p-3 bg-white/50 rounded-lg">
              <p className="text-xs text-gray-600 text-center mb-2">macro split</p>
              <div className="flex justify-around text-xs">
                <div className="text-center">
                  <p className="font-semibold text-gray-800">
                    {Math.round((result.protein * 4 / result.calories) * 100)}%
                  </p>
                  <p className="text-gray-600">protein</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">
                    {Math.round((result.carbs * 4 / result.calories) * 100)}%
                  </p>
                  <p className="text-gray-600">carbs</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">
                    {Math.round((result.fat * 9 / result.calories) * 100)}%
                  </p>
                  <p className="text-gray-600">fat</p>
                </div>
              </div>
            </div>
          </div>

          {/* buttons for recalc or go back to meal builder */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← recalculate
            </button>
            <Link
              to="/menu"
              className="block w-full text-center bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              build meals →
            </Link>
          </div>
        </div>
      </div>
    )}

    {/* show the macro calculator form if needed */}
    {showForm && (
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-700 mb-2">macro calculator</h2>
          <p className="text-gray-600">
            calculate your personalized daily macronutrient targets based on your goals
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* age input */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              age
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              placeholder="enter your age"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* sex dropdown */}
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
              sex
            </label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="m">male</option>
              <option value="f">female</option>
            </select>
          </div>

          {/* weight input */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              weight (lb)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              placeholder="enter your weight in pounds"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* height input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">height</label>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${heightUnit === 'imperial' ? 'text-primary-700 font-medium' : 'text-gray-500'}`}>
                  ft/in
                </span>
                <button
                  type="button"
                  onClick={() => setHeightUnit(heightUnit === 'imperial' ? 'metric' : 'imperial')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    heightUnit === 'metric' ? 'bg-primary-700' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      heightUnit === 'metric' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm ${heightUnit === 'metric' ? 'text-primary-700 font-medium' : 'text-gray-500'}`}>
                  cm
                </span>
              </div>
            </div>
            
            {/* show imperial or metric input based on toggle */}
            {heightUnit === 'imperial' ? (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  required
                  placeholder="feet"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  required
                  placeholder="inches"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            ) : (
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                required
                placeholder="height in centimeters"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
          </div>

          {/* activity level dropdown */}
          <div>
            <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
              activity level
            </label>
            <select
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="1.2">sedentary (little to no exercise)</option>
              <option value="1.375">light (exercise 1-3 days/week)</option>
              <option value="1.465">moderate (exercise 3-5 days/week)</option>
              <option value="1.55">active (exercise 6-7 days/week)</option>
              <option value="1.725">very active (intense exercise daily)</option>
            </select>
          </div>

          {/* goal dropdown */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              goal
            </label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="maintain">maintain weight</option>
              <option value="deficit">lose weight (cut)</option>
              <option value="bulk">gain weight (bulk)</option>
            </select>
          </div>

          {/* submit button */}
          <button
            type="submit"
            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            calculate macros
          </button>
        </form>
      </div>
    )}
  </main>
</div>

export default MacroCalculator
