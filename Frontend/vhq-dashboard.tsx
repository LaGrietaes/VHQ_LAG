import { ThemeAwareLogo } from "./components/theme-aware-logo"

export default function VHQDashboard() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <ThemeAwareLogo className="h-8 w-auto" size="small" />
            <div>
              <h1 className="text-xl font-bold tracking-wider hover-glitch">
                VHQ_LAG<span className="text-red-600">.</span>SYSTEM
              </h1>
              <div className="text-xs text-gray-400">Virtual Head Quarters</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>
          {/* Add your dashboard content here */}
          <p>Welcome to the VHQ Dashboard!</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center">
        <p className="text-sm text-gray-500">Copyright &copy; 2023 Virtual Head Quarters</p>
      </footer>
    </div>
  )
}
