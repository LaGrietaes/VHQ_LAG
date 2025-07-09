import { ThemeAwareLogo } from "./components/theme-aware-logo"

function SmartDashboard() {
  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="h-16 w-full flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <ThemeAwareLogo className="h-8 w-auto" size="small" />
          <div>
            <div className="text-xs text-gray-400">Virtual Head Quarters</div>
          </div>
        </div>
        <div>{/* Placeholder for user info or actions */}</div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
          {/* Sidebar content */}
          Sidebar
        </div>
        <div className="flex-1 p-4">
          {/* Main content area */}
          Main Content
        </div>
      </div>
    </div>
  )
}

export default SmartDashboard
