import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

import { getIncidentAnalytics } from '../api/api'

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await getIncidentAnalytics()

      if (response.success) {
        setAnalytics(response.analytics)
      } else {
        setError('Unable to load analytics.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading analytics...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        {error}
        <button
          onClick={loadAnalytics}
          className="ml-4 rounded-lg bg-red-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    )
  }

  const severityData = Object.entries(
    analytics.severity_breakdown || {}
  ).map(([name, value]) => ({
    name,
    value
  }))

  const serviceData = analytics.service_breakdown || []

  const stats = [
    {
      title: 'Total Incidents',
      value: analytics.total_incidents,
      icon: Activity,
      color: 'text-blue-400'
    },
    {
      title: 'Resolved Incidents',
      value: analytics.resolved_incidents,
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      title: 'Pending Incidents',
      value: analytics.pending_incidents,
      icon: Clock,
      color: 'text-yellow-400'
    },
    {
      title: 'High Severity',
      value: analytics.severity_breakdown?.High || 0,
      icon: AlertTriangle,
      color: 'text-red-400'
    }
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Production incident statistics and service insights
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-700 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">
                  {stat.title}
                </p>
                <Icon className={stat.color} size={22} />
              </div>

              <h2 className="mt-3 text-3xl font-bold text-white">
                {stat.value}
              </h2>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Severity Chart */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Incident Severity Distribution
          </h2>

          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {severityData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-20 text-center text-slate-500">
              No severity data available.
            </p>
          )}
        </div>

        {/* Service Chart */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="mb-5 text-lg font-semibold text-white">
            Incidents by Service
          </h2>

          {serviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#334155"
                />

                <XAxis
                  dataKey="service"
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                />

                <YAxis stroke="#94a3b8" allowDecimals={false} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />

                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-20 text-center text-slate-500">
              No service data available.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Analytics