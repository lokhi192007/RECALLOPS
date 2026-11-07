import Analytics from './components/Analytics'
import { useState, useEffect } from 'react'

import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle,
  LayoutDashboard,
  Search,
  Settings,
  ShieldAlert,
  Bell,
  Plus,
  Clock,
  CircleDot,
} from 'lucide-react'

import NewIncident from './components/NewIncident'
import AIMemory from './components/AIMemory'
import { getIncidents } from './api/api'


// STATISTICS CARD
function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>

        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <h2 className="mt-4 text-3xl font-bold text-white">
        {value}
      </h2>

      <p className="mt-2 text-xs text-slate-500">
        {subtitle}
      </p>

    </div>
  )
}


// MAIN APPLICATION
function App() {

  const [activePage, setActivePage] = useState('Overview')

  const [incidents, setIncidents] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')


  // FETCH INCIDENTS FROM SQLITE
  const loadIncidents = async () => {

    try {

      setLoading(true)
      setError('')

      const data = await getIncidents()

      setIncidents(data.incidents || [])

    } catch (err) {

      console.error('Failed to load incidents:', err)

      setError('Unable to load incidents. Check backend connection.')

    } finally {

      setLoading(false)

    }
  }


  // LOAD INCIDENTS WHEN DASHBOARD OPENS
  useEffect(() => {
    loadIncidents()
  }, [])


  // DASHBOARD STATISTICS
  const totalIncidents = incidents.length

  const criticalIncidents = incidents.filter(
    (incident) =>
      incident.severity?.toLowerCase() === 'critical'
  ).length

  const resolvedIncidents = incidents.filter(
    (incident) => {

      const outcome = incident.outcome?.toLowerCase() || ''

      return (
        outcome.includes('resolved') ||
        outcome.includes('recovered') ||
        outcome.includes('successful')
      )

    }
  ).length


  // FORMAT DATE
  const formatDate = (date) => {

    if (!date) return 'Recently'

    const parsedDate = new Date(
      date.replace(' ', 'T') + 'Z'
    )

    if (Number.isNaN(parsedDate.getTime())) {
      return date
    }

    return parsedDate.toLocaleString()
  }


  return (

    <div className="min-h-screen bg-slate-950 text-slate-100">


      {/* SIDEBAR */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 p-6 md:block">


        {/* LOGO */}

        <div className="flex items-center gap-3">

          <div className="rounded-lg bg-cyan-500 p-2 text-slate-950">
            <BrainCircuit size={25} />
          </div>

          <div>

            <h1 className="text-xl font-bold">
              RECALL<span className="text-cyan-400">OPS</span>
            </h1>

            <p className="text-xs text-slate-500">
              Incident Intelligence
            </p>

          </div>

        </div>


        {/* NAVIGATION */}

        <div className="mt-12">

          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">

            {[
              { name: 'Overview', icon: LayoutDashboard },
              { name: 'New Incident', icon: Plus },
              { name: 'AI Memory', icon: BrainCircuit },
              { name: 'Analytics', icon: Activity },
            ].map((item) => {

              const Icon = item.icon

              return (

                <button
                  key={item.name}
                  onClick={() => setActivePage(item.name)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${
                    activePage === item.name
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >

                  <Icon size={19} />

                  {item.name}

                </button>

              )

            })}

          </nav>

        </div>


        {/* SYSTEM STATUS */}

        <div className="absolute bottom-6 left-6 right-6">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">

            <div className="flex items-center gap-2 text-emerald-400">

              <CircleDot size={12} />

              <span className="text-sm font-medium">
                System Online
              </span>

            </div>

            <p className="mt-2 text-xs text-slate-500">
              RECALLOPS monitoring active
            </p>

          </div>


          <button
            onClick={() => setActivePage('Settings')}
            className="mt-4 flex w-full items-center gap-3 px-2 py-2 text-sm text-slate-400"
          >

            <Settings size={18} />

            Settings

          </button>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="md:ml-64">


        {/* HEADER */}

        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-5 py-5 backdrop-blur md:px-8">

          <div>

            <h2 className="text-xl font-semibold">

              {activePage === 'Overview'
                ? 'Dashboard Overview'
                : activePage}

            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Production incident intelligence center
            </p>

          </div>


          <div className="flex items-center gap-3">

            <button
              onClick={loadIncidents}
              className="rounded-lg border border-slate-800 p-2 text-slate-400 hover:text-cyan-400"
              title="Refresh incidents"
            >

              <Activity size={19} />

            </button>


            <button className="rounded-lg border border-slate-800 p-2 text-slate-400">

              <Bell size={19} />

            </button>


            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 sm:flex">

              <Search size={16} className="text-slate-500" />

              <span className="text-sm text-slate-500">
                Search incidents
              </span>

            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <div className="space-y-8 p-5 md:p-8">


          {/* NEW INCIDENT PAGE */}

          {activePage === 'New Incident' ? (
            <NewIncident />
          ) : activePage === 'AI Memory' ? (
             <AIMemory />
          ) : activePage === 'Analytics' ? (
            <Analytics />
          ) : activePage === 'Overview' ? (
            <>


              {/* WELCOME SECTION */}

              <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <p className="text-sm text-cyan-400">
                    INCIDENT COMMAND CENTER
                  </p>

                  <h1 className="mt-2 text-3xl font-bold">
                    Welcome to RECALLOPS
                  </h1>

                  <p className="mt-2 text-sm text-slate-400">
                    Learn from yesterday's failures. Prevent tomorrow's incidents.
                  </p>

                </div>


                <button
                  onClick={() => setActivePage('New Incident')}
                  className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
                >

                  <Plus size={19} />

                  New Incident

                </button>

              </section>


              {/* STATISTICS */}

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                  title="Total Incidents"
                  value={totalIncidents}
                  subtitle="Stored in SQLite"
                  icon={Activity}
                  color="bg-cyan-500/10 text-cyan-400"
                />

                <StatCard
                  title="Critical Incidents"
                  value={criticalIncidents}
                  subtitle="Require attention"
                  icon={ShieldAlert}
                  color="bg-red-500/10 text-red-400"
                />

                <StatCard
                  title="Resolved Incidents"
                  value={resolvedIncidents}
                  subtitle="Documented outcomes"
                  icon={CheckCircle}
                  color="bg-emerald-500/10 text-emerald-400"
                />

                <StatCard
                  title="AI Memory"
                  value="Active"
                  subtitle="Hindsight connected"
                  icon={BrainCircuit}
                  color="bg-purple-500/10 text-purple-400"
                />

              </section>


              {/* AI INTELLIGENCE */}

              <section className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 to-slate-900 p-6">

                <div className="flex items-center gap-4">

                  <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                    <BrainCircuit size={25} />
                  </div>

                  <div>

                    <h3 className="text-lg font-semibold">
                      AI Incident Intelligence
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Learn from historical incidents and generate investigation recommendations.
                    </p>

                  </div>

                </div>

              </section>


              {/* INCIDENT HISTORY */}

              <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">


                <div className="flex items-center justify-between border-b border-slate-800 p-5">

                  <div>

                    <h3 className="font-semibold">
                      Recent Incidents
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Live records from SQLite database
                    </p>

                  </div>


                  <button
                    onClick={loadIncidents}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >

                    Refresh

                  </button>

                </div>


                {loading ? (

                  <div className="p-8 text-center text-slate-400">
                    Loading incident history...
                  </div>

                ) : error ? (

                  <div className="p-8 text-center text-red-400">
                    {error}
                  </div>

                ) : incidents.length === 0 ? (

                  <div className="p-8 text-center text-slate-400">
                    No incidents found. Create your first incident!
                  </div>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[750px] text-left text-sm">

                      <thead className="bg-slate-950/60 text-xs uppercase text-slate-500">

                        <tr>

                          <th className="px-5 py-4">
                            Incident ID
                          </th>

                          <th className="px-5 py-4">
                            Service
                          </th>

                          <th className="px-5 py-4">
                            Problem
                          </th>

                          <th className="px-5 py-4">
                            Severity
                          </th>

                          <th className="px-5 py-4">
                            Outcome
                          </th>

                          <th className="px-5 py-4">
                            Time
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {incidents.map((incident) => (

                          <tr
                            key={incident.incident_id}
                            className="border-t border-slate-800 hover:bg-slate-800/40"
                          >

                            <td className="px-5 py-4 font-medium text-cyan-400">
                              {incident.incident_id}
                            </td>

                            <td className="px-5 py-4 text-slate-300">
                              {incident.service}
                            </td>

                            <td className="px-5 py-4 text-slate-400">
                              {incident.problem}
                            </td>

                            <td className="px-5 py-4">

                              <span className={
                                incident.severity?.toLowerCase() === 'critical'
                                  ? 'text-red-400'
                                  : incident.severity?.toLowerCase() === 'high'
                                    ? 'text-orange-400'
                                    : 'text-yellow-400'
                              }>

                                {incident.severity}

                              </span>

                            </td>

                            <td className="px-5 py-4 text-slate-400">
                              {incident.outcome || 'Pending'}
                            </td>

                            <td className="px-5 py-4 text-slate-500">

                              <span className="flex items-center gap-2">

                                <Clock size={14} />

                                {formatDate(incident.created_at)}

                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>

            </>


          ) : (

            /* OTHER PAGES */

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">

              <AlertTriangle className="mb-3 text-cyan-400" size={28} />

              <h3 className="text-xl font-semibold">
                {activePage}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                This section will be developed in the next steps.
              </p>

            </div>

          )}


          {/* FOOTER */}

          <footer className="border-t border-slate-800 pt-5 text-xs text-slate-500">

            RECALLOPS — AI Production Incident Intelligence | Powered by Groq + Hindsight

          </footer>


        </div>

      </main>

    </div>

  )

}

export default App