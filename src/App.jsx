import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Menu from './pages/Menu'
import NotFound from './pages/NotFound'
import MacroCalculator from './pages/MacroCalculator'

//general routing back to the menu, macro calculator, or not found depending on condition
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/calculator" element={<MacroCalculator />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App

