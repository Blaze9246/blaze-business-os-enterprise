import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Dashboard
export const getDashboardStats = () => api.get('/api/dashboard/stats')
export const getRecentActivity = () => api.get('/api/dashboard/activity')

// Tasks
export const getTasks = () => api.get('/api/tasks')
export const createTask = (data: any) => api.post('/api/tasks', data)
export const updateTask = (id: string, data: any) => api.patch(`/api/tasks/${id}`, data)

// Agents
export const getAgents = () => api.get('/api/agents')
export const runAgent = (id: string) => api.post(`/api/agents/${id}/run`)

// Stores
export const getStores = () => api.get('/api/stores')
export const createStore = (data: any) => api.post('/api/stores', data)
export const syncStore = (id: string) => api.post(`/api/stores/${id}/sync`)

// Leads
export const getLeads = () => api.get('/api/leads')
export const createLead = (data: any) => api.post('/api/leads', data)

// Workflows
export const getWorkflows = () => api.get('/api/workflows')
export const createWorkflow = (data: any) => api.post('/api/workflows', data)
export const runWorkflow = (id: string) => api.post(`/api/workflows/${id}/run`)

// Revenue
export const getRevenue = (days = 30) => api.get(`/api/revenue?days=${days}`)

// Shopify Integration
export const getShopifyOrders = (storeId: string, limit = 50) => 
  api.get(`/api/stores/${storeId}/shopify/orders?limit=${limit}`)

export const getShopifyProducts = (storeId: string, limit = 50) => 
  api.get(`/api/stores/${storeId}/shopify/products?limit=${limit}`)

export const getShopifyAnalytics = (storeId: string, startDate?: string, endDate?: string) => 
  api.get(`/api/stores/${storeId}/shopify/analytics?startDate=${startDate}&endDate=${endDate}`)

export const getShopifyInventory = (storeId: string) => 
  api.get(`/api/stores/${storeId}/shopify/inventory`)

// Omnisend Integration
export const getOmnisendContacts = (limit = 50) => 
  api.get(`/api/omnisend/contacts?limit=${limit}`)

export const getOmnisendCampaigns = () => 
  api.get('/api/omnisend/campaigns')

export const getOmnisendAnalytics = (startDate?: string, endDate?: string) => 
  api.get(`/api/omnisend/analytics?startDate=${startDate}&endDate=${endDate}`)

export const createOmnisendCampaign = (data: any) => 
  api.post('/api/omnisend/campaigns', data)
