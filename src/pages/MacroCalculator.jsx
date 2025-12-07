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

    // Validate inputs
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

    // Calculate height in cm
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

    // Calculate BMR using Mifflin-St Jeor equation
    let BMR
    if (sex === 'm') {
      BMR = 10 * weightKg + 6.25 * cm - 5 * ageNum + 5
    } else {
      BMR = 10 * weightKg + 6.25 * cm - 5 * ageNum - 161
    }

    // Calculate TDEE (maintenance calories)
    const TDEE = BMR * parseFloat(activity)

    // Adjust calories and protein based on goal
    let calories, protein
    if (goal === 'deficit' || goal === 'cut') {
      calories = TDEE * 0.85  // 15% deficit
      protein = weightLb * 1.15  // Higher protein for cutting
    } else if (goal === 'bulk') {
      calories = TDEE * 1.10  // 10% surplus
      protein = weightLb * 1.05  // Moderate protein for bulking
    } else {
      calories = TDEE  // Maintenance
      protein = weightLb * 0.85  // Standard protein
    }

    // Calculate fat (minimum 0.30g per lb, prefer 28% of calories)
    const fatMin = weightLb * 0.30
    const fatPref = (0.28 * calories) / 9
    const fat = Math.max(fatMin, fatPref)

    // Calculate carbs from remaining calories
    const carbCalories = calories - protein * 4 - fat * 9
    const carbs = carbCalories < 200 ? 50 : carbCalories / 4

    setResult({
      maintenance: Math.round(TDEE),
      calories: Math.round(calories),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
    })
    
    // Hide form and show results
    setShowForm(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
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
              <p className="text-xs md:text-sm text-white/90">Tracking Made Easy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <Link to="/menu">
          <button className="mb-4 flex items-center gap-2 text-primary-700 hover:text-primary-800 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </button>
        </Link>

        {/* Results Section - Shows at top when available */}
        {result && !showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
            <div className="space-y-4">
              {/* Maintenance Calories */}
              <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Maintenance Calories (TDEE)</span>
                  <span className="text-xl font-bold text-gray-900">{result.maintenance} cal</span>
                </div>
              </div>

              {/* Target Macros */}
              <div className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-2 border-primary-700">
                <h3 className="text-xl font-semibold mb-4 text-primary-700">Your Daily Macro Targets</h3>
                
                {/* Calories - Full Width */}
                <div className="mb-4 text-center p-5 bg-white rounded-lg shadow-md">
                  <p className="text-4xl font-bold text-primary-700">{result.calories}</p>
                  <p className="text-sm text-gray-600 mt-1">Daily Calories</p>
                </div>

                {/* Macros Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-black">{result.protein}g</p>
                    <p className="text-xs text-gray-600 mt-1">Protein</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-black">{result.carbs}g</p>
                    <p className="text-xs text-gray-600 mt-1">Carbs</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-black">{result.fat}g</p>
                    <p className="text-xs text-gray-600 mt-1">Fat</p>
                  </div>
                </div>

                {/* Percentage Breakdown */}
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <p className="text-xs text-gray-600 text-center mb-2">Macro Split</p>
                  <div className="flex justify-around text-xs">
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">
                        {Math.round((result.protein * 4 / result.calories) * 100)}%
                      </p>
                      <p className="text-gray-600">Protein</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">
                        {Math.round((result.carbs * 4 / result.calories) * 100)}%
                      </p>
                      <p className="text-gray-600">Carbs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">
                        {Math.round((result.fat * 9 / result.calories) * 100)}%
                      </p>
                      <p className="text-gray-600">Fat</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  ← Recalculate
                </button>
                <Link
                  to="/menu"
                  className="block w-full text-center bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
                >
                  Build Meals →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-700 mb-2">Macro Calculator</h2>
              <p className="text-gray-600">
                Calculate your personalized daily macronutrient targets based on your goals
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                placeholder="Enter your age"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
                Sex
              </label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lb)
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                placeholder="Enter your weight in pounds"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Height</label>
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
              
              {heightUnit === 'imperial' ? (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    required
                    placeholder="Feet"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    required
                    placeholder="Inches"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  required
                  placeholder="Height in centimeters"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              )}
            </div>

            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              <select
                id="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="1.2">Sedentary (little to no exercise)</option>
                <option value="1.375">Light (exercise 1-3 days/week)</option>
                <option value="1.465">Moderate (exercise 3-5 days/week)</option>
                <option value="1.55">Active (exercise 6-7 days/week)</option>
                <option value="1.725">Very Active (intense exercise daily)</option>
              </select>
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                Goal
              </label>
              <select
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="maintain">Maintain Weight</option>
                <option value="deficit">Lose Weight (Cut)</option>
                <option value="bulk">Gain Weight (Bulk)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              Calculate Macros
            </button>
          </form>
        </div>
        )}
      </main>
    </div>
  )
}

export default MacroCalculator




