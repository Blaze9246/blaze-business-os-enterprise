import { useState } from 'react'
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
  Zap
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Script {
  id: string
  name: string
  description: string
  icon: any
  category: string
  status: 'idle' | 'running' | 'success' | 'error'
  lastRun: string | null
  nextRun: string | null
  schedule: string
  output: string[]
}

const scripts: Script[] = [
  // LEAD GENERATION
  {
    id: 'hunter-agent',
    name: 'Hunter Agent',
    description: 'Discover 10 qualified e-commerce leads with email finding',
    icon: Target,
    category: 'Lead Generation',
    status: 'idle',
    lastRun: '2 hours ago',
    nextRun: 'Tomorrow 5:00 AM',
    schedule: 'Daily at 5:00 AM',
    output: []
  },
  {
    id: 'crystal-ball',
    name: 'Crystal Ball (Lead Scoring)',
    description: 'Score and prioritize all leads (HOT/WARM/COLD/ICE)',
    icon: BarChart3,
    category: 'Lead Generation',
    status: 'idle',
    lastRun: '2 hours ago',
    nextRun: 'Tomorrow 5:30 AM',
    schedule: 'Daily at 5:30 AM',
    output: []
  },
  {
    id: 'battle-card',
    name: 'Battle Card Generator',
    description: 'Create sales intelligence cards for all leads',
    icon: FileText,
    category: 'Lead Generation',
    status: 'idle',
    lastRun: null,
    nextRun: 'On demand',
    schedule: 'Manual',
    output: []
  },
  
  // OUTREACH
  {
    id: 'outreach-agent',
    name: 'Outreach Agent',
    description: 'Send personalized cold emails to qualified leads',
    icon: Mail,
    category: 'Outreach',
    status: 'idle',
    lastRun: '1 day ago',
    nextRun: 'Today 6:00 PM',
    schedule: 'Daily at 6:00 PM',
    output: []
  },
  {
    id: 'prospect-hunter',
    name: 'Prospect Hunter',
    description: 'Find emails using Hunter.io and validate with NeverBounce',
    icon: Search,
    category: 'Outreach',
    status: 'idle',
    lastRun: null,
    nextRun: 'Manual',
    schedule: 'Manual',
    output: []
  },
  
  // CONTENT CREATION
  {
    id: 'creator-agent',
    name: 'Creator Agent',
    description: 'Generate Instagram carousel posts and captions',
    icon: Image,
    category: 'Content',
    status: 'idle',
    lastRun: '3 hours ago',
    nextRun: 'Tomorrow 9:00 AM',
    schedule: 'Daily at 9:00 AM',
    output: []
  },
  {
    id: 'content-forge',
    name: 'Content Forge',
    description: 'Generate multi-brand Instagram content with scheduling',
    icon: Zap,
    category: 'Content',
    status: 'idle',
    lastRun: null,
    nextRun: 'Manual',
    schedule: 'Manual',
    output: []
  },
  {
    id: 'campaign-generator',
    name: 'Campaign Generator V2',
    description: 'Generate multi-channel campaigns from product URL',
    icon: FileSpreadsheet,
    category: 'Content',
    status: 'idle',
    lastRun: null,
    nextRun: 'Manual',
    schedule: 'Manual',
    output: []
  },
  
  // AUDIT & ANALYSIS
  {
    id: 'auditor-agent',
    name: 'Auditor Agent',
    description: 'Run 50+ checks on Shopify stores and generate reports',
    icon: Search,
    category: 'Audit',
    status: 'idle',
    lastRun: '1 day ago',
    nextRun: 'Manual',
    schedule: 'Manual',
    output: []
  },
  {
    id: 'competitor-tracker',
    name: 'Competitor Tracker',
    description: 'Monitor competitor price changes and new products',
    icon: Target,
    category: 'Audit',
    status: 'idle',
    lastRun: '5 hours ago',
    nextRun: 'Tomorrow 8:00 AM',
    schedule: 'Daily at 8:00 AM',
    output: []
  },
  {
    id: 'proposal-forge',
    name: 'Proposal Forge',
    description: 'Generate customized proposals from audit data',
    icon: FileText,
    category: 'Audit',
    status: 'idle',
    lastRun: null,
    nextRun: 'Manual',
    schedule: 'Manual',
    output: []
  },
  
  // OPERATIONS
  {
    id: 'operator-agent',
    name: 'Operator Agent',
    description: 'Sync Systeme.io, Shopify, and Omnisend data',
    icon: RefreshCw,
    category: 'Operations',
    status: 'idle',
    lastRun: '30 minutes ago',
    nextRun: 'In 30 minutes',
    schedule: 'Every hour',
    output: []
  },
  {
    id: 'revenue-oracle',
    name: 'Revenue Oracle',
    description: 'Forecast MRR 3-6 months ahead with scenarios',
    icon: BarChart3,
    category: 'Operations',
    status: 'idle',
    lastRun: '1 day ago',
    nextRun: 'Weekly on Monday',
    schedule: 'Weekly',
    output: []
  },
  
  // MIDNIGHT MAGIC
  {
    id: 'midnight-magic',
    name: 'Midnight Magic',
    description: 'Daily surprise automation builds',
    icon: Zap,
    category: 'Automation',
    status: 'idle',
    lastRun: 'Last night 3:00 AM',
    nextRun: 'Tonight 3:00 AM',
    schedule: 'Daily at 3:00 AM',
    output: []
  },
  
  // RECIPE VAULT
  {
    id: 'recipe-vault-sync',
    name: 'Recipe Vault Sync',
    description: 'Sync recipes from WhatsApp to backend',
    icon: Download,
    category: 'Personal',
    status: 'idle',
    lastRun: null,
    nextRun: 'Manual',
    schedule: 'Manual',
    output: []
  },
]

const categories = [
  'All',
  'Lead Generation',
  'Outreach',
  'Content',
  'Audit',
  'Operations',
  'Automation',
  'Personal'
]

export default function Automation() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set())
  const [scriptOutput, setScriptOutput] = useState<Record<string, string[]>>({})
  const [expandedScript, setExpandedScript] = useState<string | null>(null)

  const filteredScripts = activeCategory === 'All' 
    ? scripts 
    : scripts.filter(s => s.category === activeCategory)

  const handleRunScript = async (scriptId: string) => {
    setRunningScripts(prev => new Set(prev).add(scriptId))
    
    // Add initial output
    setScriptOutput(prev => ({
      ...prev,
      [scriptId]: [`[${new Date().toLocaleTimeString()}] Starting ${scriptId}...`]
    }))
    
    // Simulate script execution with progressive output
    const steps = [
      'Initializing...',
      'Loading configuration...',
      'Connecting to APIs...',
      'Processing data...',
      'Generating output...',
      'Saving results...',
      'Complete!'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setScriptOutput(prev => ({
        ...prev,
        [scriptId]: [...(prev[scriptId] || []), `[${new Date().toLocaleTimeString()}] ${steps[i]}`]
      }))
    }
    
    setRunningScripts(prev => {
      const next = new Set(prev)
      next.delete(scriptId)
      return next
    })
  }

  const getStatusIcon = (scriptId: string, status: string) => {
    if (runningScripts.has(scriptId)) {
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />
    }
    
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Play className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Automation Center</h1>
          <p className="text-gray-400">Manually execute any automation script.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => scripts.forEach(s => handleRunScript(s.id))}
            disabled={runningScripts.size > 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            <Zap className="w-4 h-4" />
            Run All
          </button>
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
          const output = scriptOutput[script.id] || []
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
                    {getStatusIcon(script.id, script.status)}
                  </button>
                </div>

                <p className="text-sm text-gray-400 mb-3">{script.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {script.schedule}
                  </div>
                  
                  {script.lastRun && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Last: {script.lastRun}
                    </div>
                  )}
                </div>

                {/* Output Preview */}
                {(output.length > 0 || isRunning) && (
                  <>
                    <button
                      onClick={() => setExpandedScript(isExpanded ? null : script.id)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline mb-2"
                    >
                      <Terminal className="w-3 h-3" />
                      {isExpanded ? 'Hide' : 'Show'} Output ({output.length} lines)
                    </button>
                    
                    {isExpanded && (
                      <div className="bg-black rounded-lg p-3 font-mono text-xs overflow-auto max-h-40">
                        {output.map((line, i) => (
                          <div key={i} className="text-green-400">
                            {line}
                          </div>
                        ))}
                        {isRunning && (
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

      {/* Execution Log */}
      <div className="mt-8 bg-surface border border-border rounded-xl">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Execution Log</h2>
          </div>
        </div>
        
        <div className="p-4">
          {Object.entries(scriptOutput).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(scriptOutput).map(([scriptId, lines]) => {
                const script = scripts.find(s => s.id === scriptId)
                return (
                  <div key={scriptId} className="bg-black rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-primary font-medium">{script?.name}</span>
                      <span className="text-gray-500">({lines.length} lines)</span>
                    </div>
                    <div className="font-mono text-xs space-y-1">
                      {lines.slice(-3).map((line, i) => (
                        <div key={i} className="text-green-400 truncate">{line}</div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No scripts have been executed yet.</p>
              <p className="text-sm">Click the play button on any script to run it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
