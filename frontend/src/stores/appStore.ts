import { create } from 'zustand'

interface Store {
  // Dashboard
  stats: {
    revenue: number
    revenueChange: string
    tasks: number
    tasksChange: string
    agents: number
    agentsStatus: string
    stores: number
    storesStatus: string
  }
  activity: any[]
  
  // Data
  tasks: any[]
  agents: any[]
  stores: any[]
  leads: any[]
  workflows: any[]
  revenue: any[]
  
  // Loading states
  loading: {
    dashboard: boolean
    tasks: boolean
    agents: boolean
    stores: boolean
    leads: boolean
    workflows: boolean
  }
  
  // Actions
  setStats: (stats: any) => void
  setActivity: (activity: any[]) => void
  setTasks: (tasks: any[]) => void
  setAgents: (agents: any[]) => void
  setStores: (stores: any[]) => void
  setLeads: (leads: any[]) => void
  setWorkflows: (workflows: any[]) => void
  setRevenue: (revenue: any[]) => void
  setLoading: (key: string, value: boolean) => void
}

export const useAppStore = create<Store>((set) => ({
  // Initial state
  stats: {
    revenue: 24500,
    revenueChange: '+12.5%',
    tasks: 24,
    tasksChange: '+3 today',
    agents: 6,
    agentsStatus: 'All active',
    stores: 3,
    storesStatus: '1 needs attention',
  },
  activity: [],
  tasks: [],
  agents: [],
  stores: [],
  leads: [],
  workflows: [],
  revenue: [],
  loading: {
    dashboard: false,
    tasks: false,
    agents: false,
    stores: false,
    leads: false,
    workflows: false,
  },
  
  // Actions
  setStats: (stats) => set({ stats }),
  setActivity: (activity) => set({ activity }),
  setTasks: (tasks) => set({ tasks }),
  setAgents: (agents) => set({ agents }),
  setStores: (stores) => set({ stores }),
  setLeads: (leads) => set({ leads }),
  setWorkflows: (workflows) => set({ workflows }),
  setRevenue: (revenue) => set({ revenue }),
  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value },
  })),
}))
