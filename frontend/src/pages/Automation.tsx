import { useState, useEffect, useCallback } from 'react'
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Terminal,
  RefreshCw,
  Download,
  FileText,
  Target,
  Mail,
  Image,
  Search,
  BarChart3,
  FileSpreadsheet,
  Zap,
  Users,
  Bot,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { api } from '../lib/api'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Script {
  id: string
  name: string
  description: string
  icon: any
  category: string
  schedule: string
}

const iconMap: Record<string, any> = {
  'Lead Generation': Target,
  'Outreach': Mail,
  'Content': Image,
  'Audit': Search,
  'Operations': BarChart3,
  'Automation': Zap,
}

const categories = [
  'All',
  'Lead Generation',
  'Outreach',
  'Content',
  'Audit',
  'Operations',
  'Automation'
]

export default function Automation() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [scripts, setScripts] = useState<Script[]>([])
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set())
  const [scriptOutput, setScriptOutput] = useState<Record<string, any>>({})
  const [expandedScript, setExpandedScript] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch scripts on mount
  useEffect(() => {
    fetchScripts()
    const interval = setInterval(fetchRunningExecutions, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  const fetchScripts = async () => {
    try {
      const res = await api.get('/api/scripts')
      // Add icons to scripts
      const scriptsWithIcons = res.data.map((s: any) => ({
        ...s,
        icon: iconMap[s.category] || Bot
      }))
      setScripts(scriptsWithIcons)
    } catch (error) {
      console.error('Failed to fetch scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRunningExecutions = async () => {
    try {
      const res = await api.get('/api/scripts/executions')
      const running = new Set(res.data.map((e: any) => e.scriptId))
      setRunningScripts(running)
    } catch (error) {
      // Ignore errors
    }
  }

  const handleRunScript = async (scriptId: string) => {
    setRunningScripts(prev => new Set(prev).add(scriptId))
    
    try {
      const res = await api.post(`/api/scripts/${scriptId}/execute`, {})
      const executionId = res.data.executionId
      
      // Add initial output
      setScriptOutput(prev => ({
        ...prev,
        [scriptId]: {
          executionId,
          lines: [`[${new Date().toLocaleTimeString()}] Starting ${scriptId}...`],
          status: 'running'
        }
      }))

      // Poll for updates
      pollExecutionStatus(scriptId, executionId)
    } catch (error) {
      console.error('Failed to start script:', error)
      setScriptOutput(prev => ({
        ...prev,
        [scriptId]: {
          lines: [`[${new Date().toLocaleTimeString()}] Error: Failed to start script`],
          status: 'error'
        }
      }))
      setRunningScripts(prev => {
        const next = new Set(prev)
        next.delete(scriptId)
        return next
      })
    }
  }

  const pollExecutionStatus = async (scriptId: string, executionId: string) => {
    const checkStatus = async () => {
      try {
        const res = await api.get(`/api/scripts/executions/${executionId}`)
        const data = res.data
        
        setScriptOutput(prev => ({
          ...prev,
          [scriptId]: {
            executionId,
            lines: data.output?.map((o: any) => o.data) || prev[scriptId]?.lines || [],
            status: data.status
          }
        }))

        if (data.status === 'completed' || data.status === 'failed') {
          setRunningScripts(prev => {
            const next = new Set(prev)
            next.delete(scriptId)
            return next
          })
        } else {
          // Continue polling
          setTimeout(checkStatus, 2000)
        }
      } catch (error) {
        console.error('Failed to check status:', error)
      }
    }
    
    checkStatus()
  }

  const filteredScripts = activeCategory === 'All' 
    ? scripts 
    : scripts.filter(s => s.category === activeCategory)

  const getStatusIcon = (scriptId: string) => {
    if (runningScripts.has(scriptId)) {
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />
    }
    return <Play className="w-5 h-5 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Automation Center</h1>
          <p className="text-gray-400">Execute automation scripts manually.</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-surface-light text-gray-400 hover:text-white'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Scripts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredScripts.map((script) => {
          const isRunning = runningScripts.has(script.id)
          const isExpanded = expandedScript === script.id
          const output = scriptOutput[script.id]
          const Icon = script.icon
          
          return (
            <div 
              key={script.id} 
              className={cn(
                'bg-surface border rounded-xl overflow-hidden transition-all',
                isRunning ? 'border-primary' : 'border-border'
              )}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isRunning ? 'bg-primary/20' : 'bg-surface-light'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        isRunning ? 'text-primary' : 'text-gray-400'
                      )} />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-white">{script.name}</h3>
                      <span className="text-xs text-gray-400">{script.category}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRunScript(script.id)}
                    disabled={isRunning}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isRunning 
                        ? 'bg-primary/20 cursor-not-allowed' 
                        : 'bg-surface-light hover:bg-primary/20 text-gray-400 hover:text-primary'
                    )}
                  >
                    {getStatusIcon(script.id)}
                  </button>
                </div>

                <p className="text-sm text-gray-400 mb-3">{script.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {script.schedule}
                  </div>
                </div>

                {/* Output Preview */}
                {output && (
                  <>
                    <button
                      onClick={() => setExpandedScript(isExpanded ? null : script.id)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline mb-2"
                    >
                      <Terminal className="w-3 h-3" />
                      {isExpanded ? 'Hide' : 'Show'} Output ({output.lines?.length || 0} lines)
                      {output.status === 'running' && <span className="text-amber-400 ml-1">(Running...)</span>}
                    </button>
                    
                    {isExpanded && (
                      <div className="bg-black rounded-lg p-3 font-mono text-xs overflow-auto max-h-40">
                        {output.lines?.map((line: string, i: number) => (
                          <div key={i} className="text-green-400 truncate">{line}</div>
                        ))}
                        {output.status === 'running' && (
                          <div className="text-primary animate-pulse">_</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
