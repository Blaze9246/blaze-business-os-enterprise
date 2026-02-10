import { useUser } from '@clerk/clerk-react'
import { User, Building2, Bell, Shield } from 'lucide-react'

export default function Settings() {
  const { user } = useUser()

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-400 rounded-full flex items-center justify-center text-2xl font-bold">
                {user?.firstName?.[0] || 'Z'}
              </div>
            )}
            <div>
              <p className="font-semibold text-white">{user?.fullName || 'Zain Moolla'}</p>
              <p className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress || 'zain@blazeignite.com'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">First Name</label>
              <input
                type="text"
                defaultValue={user?.firstName || 'Zain'}
                className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Last Name</label>
              <input
                type="text"
                defaultValue={user?.lastName || 'Moolla'}
                className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Company */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Company</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="Blaze Ignite"
                className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Website</label>
              <input
                type="url"
                defaultValue="https://blazeignite.com"
                className="w-full px-3 py-2 bg-surface-light border border-border rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Daily briefing emails', checked: true },
              { label: 'Agent completion notifications', checked: true },
              { label: 'Store sync alerts', checked: true },
              { label: 'New lead alerts', checked: false },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="w-4 h-4 rounded border-border bg-surface-light text-primary focus:ring-primary"
                />
                <span className="text-white">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>

          <div className="space-y-4">
            <button className="w-full px-4 py-2 bg-surface-light hover:bg-white/5 border border-border rounded-lg text-white text-left transition-colors">
              Change Password
            </button>
            <button className="w-full px-4 py-2 bg-surface-light hover:bg-white/5 border border-border rounded-lg text-white text-left transition-colors">
              Two-Factor Authentication
            </button>
            <button className="w-full px-4 py-2 bg-surface-light hover:bg-white/5 border border-border rounded-lg text-white text-left transition-colors">
              API Keys
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
