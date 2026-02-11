import { useState, useEffect } from 'react'
import { 
  Bot, 
  User, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  Play,
  Pause,
  RotateCw
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Agent {
  id: string
  name: string
  role: string
  avatar: string
  status: 'idle' | 'working' | 'completed' | 'error'
  progress: number
  currentTask?: string
  subAgents?: Agent[]
}

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  progress: number
  assignedTo: string
  startTime?: Date
  endTime?: Date
}

// Mock data for task orchestration
const mockOrchestration = {
  orchestrator: {
    id: 'blaze',
    name: 'Blaze',
    role: 'Orchestrator',
    avatar: '🔥',
    status: 'working',
    progress: 65,
    currentTask: 'Managing 6 agents'
  },
  agents: [
    {
      id: 'hunter',
      name: 'Hunter Agent',
      role: 'Lead Discovery',
      avatar: '🎯',
      status: 'completed',
      progress: 100,
      currentTask: 'Found 10 leads',
      subAgents: [
        { id: 'hunter-1', name: 'Store Scraper', role: 'Scraper', avatar: '🔍', status: 'completed', progress: 100 },
        { id: 'hunter-2', name: 'Email Finder', role: 'Finder', avatar: '📧', status: 'completed', progress: 100 }
      ]
    },
    {
      id: 'outreach',
      name: 'Outreach Agent',
      role: 'Cold Email',
      avatar: '📤',
      status: 'working',
      progress: 45,
      currentTask: 'Sending 50 emails',
      subAgents: [
        { id: 'outreach-1', name: 'Template Engine', role: 'Writer', avatar: '✍️', status: 'completed', progress: 100 },
        { id: 'outreach-2', name: 'Email Sender', role: 'Sender', avatar: '📨', status: 'working', progress: 45 }
      ]
    },
    {
      id: 'creator',
      name: 'Creator Agent',
      role: 'Content',
      avatar: '🎨',
      status: 'working',
      progress: 78,
      currentTask: 'Generating Instagram carousel',
      subAgents: [
        { id: 'creator-1', name: 'Image Gen', role: 'Designer', avatar: '🖼️', status: 'working', progress: 80 },
        { id: 'creator-2', name: 'Caption Writer', role: 'Writer', avatar: '📝', status: 'completed', progress: 100 }
      ]
    },
    {
      id: 'auditor',
      name: 'Auditor Agent',
      role: 'Store Audit',
      avatar: '🔍',
      status: 'idle',
      progress: 0,
      currentTask: 'Waiting for task'
    },
    {
      id: 'operator',
      name: 'Operator Agent',
      role: 'Sync',
      avatar: '🔄',
      status: 'completed',
      progress: 100,
      currentTask: 'Synced 3 stores',
      subAgents: [
        { id: 'operator-1', name: 'Shopify Sync', role: 'Sync', avatar: '🏪', status: 'completed', progress: 100 },
        { id: 'operator-2', name: 'Omnisend Sync', role: 'Sync', avatar: '📧', status: 'completed', progress: 100 }
      ]
    },
    {
      id: 'reporter',
      name: 'Reporter Agent',
      role: 'Analytics',
      avatar: '📊',
      status: 'working',
      progress: 30,
      currentTask: 'Generating daily report',
      subAgents: [
        { id: 'reporter-1', name: 'Data Collector', role: 'Collector', avatar: '📥', status: 'working', progress: 60 },
        { id: 'reporter-2', name: 'Chart Generator', role: 'Visualizer', avatar: '📈', status: 'pending', progress: 0 }
      ]
    }
  ]
}

function AgentNode({ agent, isSubAgent = false }: { agent: Agent; isSubAgent?: boolean }) {
  const statusColors = {
    idle: 'bg-gray-500',
    working: 'bg-amber-500 animate-pulse',
    completed: 'bg-green-500',
    error: 'bg-red-500'
  }

  const statusIcons = {
    idle: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
    working: <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    error: <AlertCircle className="w-4 h-4 text-red-400" />
  }

  return (
    <div className={cn(
      'relative rounded-xl border p-4 transition-all',
      isSubAgent ? 'bg-surface/50 border-border/50' : 'bg-surface border-border',
      agent.status === 'working' && 'ring-2 ring-primary/50'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{agent.avatar}</div>
          <div>
            <h3 className={cn(
              'font-semibold text-white',
              isSubAgent && 'text-sm'
            )}>{agent.name}</h3>
            <p className="text-xs text-gray-400">{agent.role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            statusColors[agent.status]
          )} />
          {statusIcons[agent.status]}
        </div>
      </div>

      {agent.currentTask && (
        <p className="text-sm text-gray-400 mb-3">{agent.currentTask}</p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Progress</span>
          <span className={cn(
            'font-medium',
            agent.progress === 100 ? 'text-green-400' : 'text-white'
          )}>{agent.progress}%</span>
        </div>
        
        <div className="h-2 bg-surface-light rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              agent.progress === 100 ? 'bg-green-500' : 'bg-primary'
            )}
            style={{ width: `${agent.progress}%` }}
          />
        </div>
      </div>

      {agent.subAgents && agent.subAgents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
          <p className="text-xs text-gray-500 font-medium">Sub-agents</p>
          {agent.subAgents.map(sub => (
            <AgentNode key={sub.id} agent={sub} isSubAgent />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Orchestrator() {
  const [activeView, setActiveView] = useState<'grid' | 'flow'>('grid')

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Task Orchestrator</h1>
          <p className="text-gray-400">Visualize task delegation and agent progress.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('grid')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeView === 'grid'
                ? 'bg-primary text-white'
                : 'bg-surface-light text-gray-400 hover:text-white'
            )}
          >
            Grid View
          </button>
          <button
            onClick={() => setActiveView('flow')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeView === 'flow'
                ? 'bg-primary text-white'
                : 'bg-surface-light text-gray-400 hover:text-white'
            )}
          >
            Flow View
          </button>
        </div>
      </div>

      {/* Orchestrator Node */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center text-3xl">
              🔥
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{mockOrchestration.orchestrator.name}</h2>
              <p className="text-gray-400">{mockOrchestration.orchestrator.role}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Active Agents</p>
                <p className="text-2xl font-bold text-white">{mockOrchestration.agents.filter(a => a.status === 'working').length}/6</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-400">Overall Progress</p>
                <p className="text-2xl font-bold text-primary">{mockOrchestration.orchestrator.progress}%</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-3 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all"
                style={{ width: `${mockOrchestration.orchestrator.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Connection Line */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center">
          <div className="w-px h-8 bg-gradient-to-b from-primary to-gray-600" />
          <div className="flex items-center gap-2 text-gray-500">
            <ArrowRight className="w-4 h-4 rotate-90" />
            <span className="text-sm">Delegating to 6 AI Agents</span>
          </div>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockOrchestration.agents.map((agent) => (
          <AgentNode key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-gray-400">Idle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-400">Working</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-400">Error</span>
        </div>
      </div>
    </div>
  )
}
