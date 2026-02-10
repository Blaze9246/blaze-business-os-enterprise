import { useEffect } from 'react'
import { Play, Pause, RotateCw, Bot } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { getAgents, runAgent } from '../lib/api'

const statusConfig = {
  active: { color: 'bg-green-500', badge: 'bg-green-500/20 text-green-400', label: 'Active' },
  busy: { color: 'bg-amber-500', badge: 'bg-amber-500/20 text-amber-400', label: 'Busy' },
  offline: { color: 'bg-gray-500', badge: 'bg-gray-500/20 text-gray-400', label: 'Offline' },
}

export default function Agents() {
  const { agents, setAgents, loading, setLoading } = useAppStore()

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    setLoading('agents', true)
    try {
      const res = await getAgents()
      setAgents(res.data)
    } catch (error) {
      console.error('Failed to load agents:', error)
      setAgents([
        { id: '1', name: 'Content Manager', type: 'content', status: 'active', current_task: 'Writing blog post' },
        { id: '2', name: 'Social Manager', type: 'social', status: 'busy', current_task: 'Creating Instagram content' },
        { id: '3', name: 'Email Manager', type: 'email', status: 'active', current_task: 'Monitoring campaigns' },
        { id: '4', name: 'Lead Manager', type: 'lead', status: 'offline', current_task: 'Scheduled for 2PM' },
        { id: '5', name: 'Video Manager', type: 'video', status: 'active', current_task: 'Editing product video' },
        { id: '6', name: 'Analytics Manager', type: 'analytics', status: 'active', current_task: 'Generating reports' },
      ])
    } finally {
      setLoading('agents', false)
    }
  }

  const handleRunAgent = async (id: string) => {
    try {
      await runAgent(id)
      // Refresh agents
      loadAgents()
    } catch (error) {
      console.error('Failed to run agent:', error)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Agents</h1>
        <p className="text-gray-400">Manage your AI workforce.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent: any) => (
          <div key={agent.id} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${statusConfig[agent.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} ${agent.status === 'active' ? 'animate-pulse' : ''}`} />
              
              <div className="w-12 h-12 bg-surface-light rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusConfig[agent.status as keyof typeof statusConfig]?.badge || statusConfig.offline.badge}`}>
                    {statusConfig[agent.status as keyof typeof statusConfig]?.label || agent.status}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{agent.current_task}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {agent.status === 'active' ? (
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Pause className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => handleRunAgent(agent.id)}
                    className="p-2 text-primary hover:text-primary-light hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
