import { useEffect } from 'react'
import { Workflow, Plus, Play, Clock, MoreVertical } from 'lucide-react'
import { useAppStore } from '../stores/appStore'
import { getWorkflows } from '../lib/api'

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-amber-500/20 text-amber-400',
  draft: 'bg-gray-500/20 text-gray-400',
}

export default function Workflows() {
  const { workflows, setWorkflows, setLoading } = useAppStore()

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    setLoading('workflows', true)
    try {
      const res = await getWorkflows()
      setWorkflows(res.data)
    } catch (error) {
      console.error('Failed to load workflows:', error)
      setWorkflows([
        { id: '1', name: 'Daily Lead Discovery', description: 'Automatically find 10 qualified leads daily', trigger_type: 'schedule', status: 'active', run_count: 156, last_run: '2024-02-10T10:00:00Z' },
        { id: '2', name: 'Store Sync', description: 'Sync store data every 6 hours', trigger_type: 'schedule', status: 'active', run_count: 432, last_run: '2024-02-10T12:00:00Z' },
        { id: '3', name: 'Midnight Magic', description: 'Daily automated builds at 3 AM', trigger_type: 'schedule', status: 'active', run_count: 89, last_run: '2024-02-10T03:00:00Z' },
        { id: '4', name: 'Email Campaign', description: 'Send weekly newsletter to leads', trigger_type: 'schedule', status: 'paused', run_count: 12, last_run: '2024-02-03T09:00:00Z' },
        { id: '5', name: 'New Store Onboarding', description: 'Triggered when new store is connected', trigger_type: 'webhook', status: 'draft', run_count: 0, last_run: null },
      ])
    } finally {
      setLoading('workflows', false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workflows</h1>
          <p className="text-gray-400">Automate your business processes.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workflows.map((workflow: any) => (
          <div key={workflow.id} className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-surface-light rounded-lg flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-primary" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[workflow.status as keyof typeof statusColors] || statusColors.draft}`}>
                      {workflow.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{workflow.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      {workflow.trigger_type === 'schedule' ? 'Scheduled' : 'Webhook'}
                    </div>
                    <div className="text-gray-400">
                      {workflow.run_count} runs
                    </div>
                    
                    {workflow.last_run && (
                      <div className="text-gray-400">
                        Last run: {new Date(workflow.last_run).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <Play className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
