import { useEffect, useState } from 'react'
import { Store, Plus, RefreshCw, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { getStores, syncStore } from '../lib/api'

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'Active' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bgColor: 'bg-amber-400/10', label: 'Warning' },
  error: { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-400/10', label: 'Error' },
}

export default function Stores() {
  const { stores, setStores, loading, setLoading } = useAppStore()
  const [syncingId, setSyncingId] = useState<string | null>(null)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    setLoading('stores', true)
    try {
      const res = await getStores()
      setStores(res.data)
    } catch (error) {
      console.error('Failed to load stores:', error)
      setStores([
        { id: '1', name: 'Essora Skincare', platform: 'shopify', status: 'active', revenue_monthly: 12500, orders_count: 45 },
        { id: '2', name: 'Blaze Ignite', platform: 'shopify', status: 'active', revenue_monthly: 8000, orders_count: 23 },
        { id: '3', name: 'Fashion Hub', platform: 'shopify', status: 'warning', revenue_monthly: 4000, orders_count: 12 },
      ])
    } finally {
      setLoading('stores', false)
    }
  }

  const handleSync = async (id: string) => {
    setSyncingId(id)
    try {
      await syncStore(id)
      // Show success notification
      setTimeout(() => {
        loadStores()
        setSyncingId(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to sync store:', error)
      setSyncingId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Stores</h1>
          <p className="text-gray-400">Manage your connected stores.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stores.map((store: any) => {
          const status = statusConfig[store.status as keyof typeof statusConfig] || statusConfig.active
          const StatusIcon = status.icon
          
          return (
            <div key={store.id} className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-surface-light rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{store.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${status.bgColor} ${status.color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {status.label}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-400 capitalize">{store.platform}</p>
                    
                    <div className="flex items-center gap-6 mt-4">
                      <div>
                        <p className="text-xs text-gray-400">Monthly Revenue</p>
                        <p className="text-lg font-semibold text-white">${store.revenue_monthly?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Orders</p>
                        <p className="text-lg font-semibold text-white">{store.orders_count || 0}</p>
                      </div>
                      {store.last_sync && (
                        <div>
                          <p className="text-xs text-gray-400">Last Sync</p>
                          <p className="text-sm text-white">{new Date(store.last_sync).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSync(store.id)}
                    disabled={syncingId === store.id}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${syncingId === store.id ? 'animate-spin' : ''}`} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
