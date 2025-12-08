import { Link } from 'react-router-dom'

//classic website not found error check
function NotFound() {
  return (
    <div className="min-h-screen bg-primary-700">
      {/* Header */}
      <header className="bg-primary-700 shadow-md">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/harvardmacros.png"
                  alt="Harvard Macros Logo"
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-lg font-bold text-white">Harvard Macros</h1>
                  <p className="text-xs text-white/90">Tracking Made Easy</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-white mb-8">Page Not Found</p>
        <Link 
          to="/" 
          className="px-8 py-4 bg-white text-primary-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound




