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
  const [result, setResult] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()

    // Calculate BMR using Mifflin-St Jeor equation
    const weightKg = parseFloat(weight) * 0.453592
    const heightCm = (parseFloat(feet) * 12 + parseFloat(inches)) * 2.54
    const ageNum = parseFloat(age)

    let bmr
    if (sex === 'm') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161
    }

    // Apply activity multiplier
    let calories = bmr * parseFloat(activity)

    // Adjust for goal
    if (goal === 'deficit') {
      calories *= 0.85 // 15% deficit
    } else if (goal === 'surplus') {
      calories *= 1.1 // 10% surplus
    }

    // Calculate macros
    const proteinGrams = parseFloat(weight) * 0.8 // 0.8g per lb
    const fatGrams = (calories * 0.25) / 9 // 25% of calories from fat
    const proteinCalories = proteinGrams * 4
    const fatCalories = fatGrams * 9
    const carbCalories = calories - proteinCalories - fatCalories
    const carbGrams = carbCalories / 4

    setResult({
      calories: Math.round(calories),
      protein: Math.round(proteinGrams),
      fat: Math.round(fatGrams),
      carbs: Math.round(carbGrams),
    })
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
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
                <option value="deficit">Lose Weight</option>
                <option value="surplus">Gain Weight</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md"
            >
              Calculate Macros
            </button>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border-2 border-primary-700">
              <h3 className="text-xl font-semibold mb-4 text-primary-700">Your Daily Targets</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-primary-700">{result.calories}</p>
                  <p className="text-sm text-gray-600">Calories</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-blue-600">{result.protein}g</p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-yellow-600">{result.fat}g</p>
                  <p className="text-sm text-gray-600">Fat</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-3xl font-bold text-orange-600">{result.carbs}g</p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Use the menu to build meals that match your macro targets
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MacroCalculator




