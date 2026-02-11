import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useUser, UserButton } from '@clerk/clerk-react'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bot, 
  Store, 
  Users, 
  Workflow,
  BarChart3,
  Zap,
  Settings,
  Menu,
  X,
  Flame
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'AI Agents', href: '/agents', icon: Bot },
  { name: 'Orchestrator', href: '/orchestrator', icon: Workflow },
  { name: 'Stores', href: '/stores', icon: Store },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Automation', href: '/automation', icon: Zap },
  { name: 'Chat', href: '/chat', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-void">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-400 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-white">Blaze OS</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={cn(
            'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-border">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-400 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white">Blaze OS</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
