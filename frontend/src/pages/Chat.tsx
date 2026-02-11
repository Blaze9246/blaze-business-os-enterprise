import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Paperclip, Loader2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  loading?: boolean
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hey Zain! 👋 I\'m Blaze, your AI automation architect. What can I help you with today?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Add loading message
    const loadingId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true
    }])

    // Simulate AI response (in real app, this would call your backend)
    setTimeout(() => {
      const responses: Record<string, string> = {
        'hello': 'Hey! Ready to automate some workflows? 🔥',
        'hi': 'Hi there! What are we building today?',
        'help': 'I can help you:\n• Run automation scripts\n• Check agent status\n• Generate leads\n• Create content\n• Analyze stores\n\nWhat do you need?',
        'status': 'All 6 AI agents are operational. Hunter Agent ran 2h ago, found 10 new leads. Creator Agent is processing Instagram content now.',
        'leads': 'Last run: Hunter Agent found 10 qualified leads. Want me to export them or run another search?',
        'run': 'I can trigger any automation script. Which one?\n\n1. Hunter Agent - Find leads\n2. Outreach Agent - Send emails\n3. Creator Agent - Generate content\n4. Auditor Agent - Store audit\n5. Competitor Tracker - Monitor rivals',
        'export': 'I can export:\n• Leads (CSV)\n• Store analytics\n• Campaign reports\n• Workflow logs\n\nWhich would you like?'
      }

      const lowerInput = input.toLowerCase()
      let response = 'I\'m on it! Let me process that for you. 🔥'
      
      for (const [key, value] of Object.entries(responses)) {
        if (lowerInput.includes(key)) {
          response = value
          break
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, content: response, loading: false }
          : msg
      ))
      setLoading(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-400 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Blaze Assistant</h2>
          <p className="text-sm text-green-400">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'flex-row-reverse' : ''
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              message.role === 'user' 
                ? 'bg-surface-light' 
                : 'bg-gradient-to-br from-primary to-purple-400'
            )}>
              {message.role === 'user' ? (
                <User className="w-4 h-4 text-gray-400" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            
            <div className={cn(
              'max-w-[70%] rounded-2xl px-4 py-3',
              message.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-surface-light text-white'
            )}>
              {message.loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              )}
              
              <div className={cn(
                'text-xs mt-1',
                message.role === 'user' ? 'text-primary-light' : 'text-gray-500'
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2 bg-surface-light rounded-xl p-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Blaze anything..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none min-h-[40px] max-h-[120px] py-2"
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={cn(
              'p-2 rounded-lg transition-colors',
              input.trim() && !loading
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-surface text-gray-500 cursor-not-allowed'
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
