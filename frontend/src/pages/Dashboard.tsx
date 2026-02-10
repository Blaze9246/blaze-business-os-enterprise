import { useEffect } from 'react'
import { TrendingUp, CheckSquare, Bot, Store, Activity } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { getDashboardStats, getRecentActivity } from '../lib/api'

const statsConfig = [
  { key: 'revenue', label: 'Revenue', icon: TrendingUp, color: 'text-green-400', bgColor: 'bg-green-400/10' },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-primary', bgColor: 'bg-primary/10' },
  { key: 'agents', label: 'AI Agents', icon: Bot, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  { key: 'stores', label: 'Stores', icon: Store, color: 'text-red-400', bgColor: 'bg-red-400/10' },
]

export default function Dashboard() {
  const { stats, activity, setStats, setActivity, setLoading } = useAppStore()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading('dashboard', true)
    try {
      const [statsRes, activityRes] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
      ])
      setStats(statsRes.data)
      setActivity(activityRes.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading('dashboard', false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Good afternoon, Zain!</h1>
        <p className="text-gray-400">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsConfig.map(({ key, label, icon: Icon, color, bgColor }) => (
          <div
            key={key}
            className="bg-surface border border-border rounded-xl p-4 lg:p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className={`text-sm font-medium ${
                key === 'revenue' ? 'text-green-400' :
                key === 'tasks' ? 'text-primary' :
                key === 'agents' ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {stats[`${key}Change` as keyof typeof stats]}
              </span>
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">
              {key === 'revenue' ? `$${stats.revenue.toLocaleString()}` : stats[key as keyof typeof stats]}
            </div>
            <div className="text-sm text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface border border-border rounded-xl">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {activity.length > 0 ? (
            activity.map((item: any) => (
              <div key={item.id} className="px-6 py-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-surface-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{item.title}</p>
                  <p className="text-sm text-gray-400 truncate">{item.description}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
              </div>
            ))
          ) : (
            [
              { title: 'SEO Blog Post Generated', desc: "AI Agent completed 'Summer Fashion Trends 2024'", time: '2m ago' },
              { title: 'Midnight Magic Completed', desc: 'Daily build finished successfully', time: '1h ago' },
              { title: 'Social Manager Started', desc: 'Creating Instagram content for Fashion Hub', time: '2h ago' },
              { title: 'Store Sync Failed', desc: 'Home & Garden - Shopify API error', time: '3h ago' },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-surface-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{item.title}</p>
                  <p className="text-sm text-gray-400 truncate">{item.desc}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{item.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
