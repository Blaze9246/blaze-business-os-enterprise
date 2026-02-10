import { useEffect, useState } from 'react'
import { BarChart3, Package, Users, Mail, TrendingUp, Download } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { getShopifyAnalytics, getOmnisendAnalytics } from '../lib/api'

export default function Reports() {
  const { stores } = useAppStore()
  const [selectedStore, setSelectedStore] = useState('')
  const [dateRange, setDateRange] = useState('30')
  const [shopifyData, setShopifyData] = useState<any>(null)
  const [omnisendData, setOmnisendData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0].id)
    }
  }, [stores])

  useEffect(() => {
    if (selectedStore) {
      loadData()
    }
  }, [selectedStore, dateRange])

  const loadData = async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString()

      // Get Shopify data
      const shopifyRes = await getShopifyAnalytics(selectedStore, startDate, endDate)
      setShopifyData(shopifyRes.data)

      // Get Omnisend data
      try {
        const omnisendRes = await getOmnisendAnalytics(startDate, endDate)
        setOmnisendData(omnisendRes.data)
      } catch (e) {
        // Omnisend might not be configured
        setOmnisendData(null)
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
          <p className="text-gray-400">Store performance and analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-4 py-2 bg-surface-light border border-border rounded-lg text-white"
          >
            {stores.map((store: any) => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-surface-light border border-border rounded-lg text-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-surface-light hover:bg-white/5 border border-border rounded-lg text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Shopify Analytics */}
      {shopifyData && !shopifyData.error && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-white">Shopify Analytics</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Revenue</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${shopifyData.totalRevenue?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-400">Orders</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {shopifyData.totalOrders?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-gray-400">Items Sold</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {shopifyData.totalItems?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Avg Order</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${shopifyData.averageOrderValue?.toFixed(2) || 0}
              </div>
            </div>
          </div>

          {/* Orders by Day Chart */}
          {shopifyData.ordersByDay && Object.keys(shopifyData.ordersByDay).length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Orders by Day</h3>
              <div className="space-y-2">
                {Object.entries(shopifyData.ordersByDay)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .slice(-14)
                  .map(([date, count]: [string, any]) => (
                    <div key={date} className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-24">
                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-surface-light rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{
                            width: `${Math.min((count / Math.max(...Object.values(shopifyData.ordersByDay as Record<string, number>))) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-white w-8 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Omnisend Analytics */}
      {omnisendData && !omnisendData.error && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-white">Email Marketing (Omnisend)</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-400">Total Contacts</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {omnisendData.totalContacts?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Emails Sent</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {omnisendData.recentPerformance?.sent?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-gray-400">Open Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {omnisendData.recentPerformance?.openRate?.toFixed(1) || 0}%
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Click Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {omnisendData.recentPerformance?.clickRate?.toFixed(1) || 0}%
              </div>
            </div>
          </div>

          {/* Top Campaigns */}
          {omnisendData.topPerformingCampaigns?.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Top Performing Campaigns</h3>
              <div className="divide-y divide-border">
                {omnisendData.topPerformingCampaigns.slice(0, 5).map((campaign: any) => (
                  <div key={campaign.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="text-sm text-gray-400">{campaign.subject}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">Sent: {campaign.sent}</span>
                      <span className="text-green-400">Opened: {campaign.opened}</span>
                      <span className="text-primary">{campaign.openRate?.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading reports...</div>
        </div>
      )}

      {/* No Data State */}
      {!loading && (!shopifyData || shopifyData.error) && (!omnisendData || omnisendData.error) && (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Data Available</h3>
          <p className="text-gray-400">Connect your Shopify store and Omnisend account to see reports.</p>
        </div>
      )}
    </div>
  )
}
