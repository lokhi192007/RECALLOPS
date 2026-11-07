import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Check backend health
export const checkBackend = async () => {
  const response = await api.get('/health')
  return response.data
}

// Store a new incident
export const createIncident = async (incident) => {
  const response = await api.post('/incidents/', incident)
  return response.data
}

// Search historical incidents
export const searchIncidents = async (query) => {
  const response = await api.post('/incidents/search', { query })
  return response.data
}

// Reflect on historical incidents
export const reflectIncidents = async (query) => {
  const response = await api.post('/incidents/reflect', { query })
  return response.data
}

// Analyze incident using Hindsight + Groq
export const analyzeIncident = async (incident) => {
  const response = await api.post('/incidents/analyze', incident)
  return response.data
}

// Get all incidents from SQLite
export const getIncidents = async () => {
  const response = await api.get('/incidents/')
  return response.data
}

export default api

// Get incident analytics from SQLite
export const getIncidentAnalytics = async () => {
  const response = await api.get('/incidents/analytics')
  return response.data
}

export const analyzeIncidentSimilarity = async (incident) => {
  const response = await api.post(
    '/incidents/similarity-analysis',
    incident
  )

  return response.data
}