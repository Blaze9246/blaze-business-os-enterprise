import { useEffect } from 'react'
import { Users, Plus, Filter, Download, Star, Globe } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { getLeads } from '../lib/api'

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-amber-500/20 text-amber-400',
  qualified: 'bg-green-500/20 text-green-400',
  converted: 'bg-purple-500/20 text-purple-400',
}

export default function Leads() {
  const { leads, setLeads, loading, setLoading } = useAppStore()

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setLoading('leads', true)
    try {
      const res = await getLeads()
      setLeads(res.data)
    } catch (error) {
      console.error('Failed to load leads:', error)
      setLeads([
        { id: '1', name: 'John Smith', company: 'Fashion Forward', email: 'john@fashionfwd.com', website: 'fashionfwd.com', platform: 'shopify', score: 85, status: 'qualified' },
        { id: '2', name: 'Sarah Johnson', company: 'Skincare Co', email: 'sarah@skincareco.com', website: 'skincareco.com', platform: 'shopify', score: 72, status: 'contacted' },
        { id: '3', name: 'Mike Brown', company: 'Home Decor Ltd', email: 'mike@homedecor.com', website: 'homedecor.com', platform: 'woocommerce', score: 45, status: 'new' },
        { id: '4', name: 'Emma Wilson', company: 'Beauty Box', email: 'emma@beautybox.com', website: 'beautybox.com', platform: 'shopify', score: 91, status: 'converted' },
      ])
    } finally {
      setLoading('leads', false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
          <p className="text-gray-400">Track and manage your prospects.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-light hover:bg-white/5 border border-border rounded-lg text-white transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-light hover:bg-white/5 border border-border rounded-lg text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Lead</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Platform</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Score</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-light rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-sm text-gray-400">{lead.company}</p>
                      <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">{lead.email}</a>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-white capitalize">{lead.platform}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Star className={`w-4 h-4 ${lead.score >= 80 ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                    <span className="text-white font-medium">{lead.score}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[lead.status as keyof typeof statusColors] || statusColors.new}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-primary hover:text-primary-light text-sm font-medium">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
