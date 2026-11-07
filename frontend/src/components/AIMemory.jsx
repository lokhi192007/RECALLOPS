import { useState, useEffect } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  Search,
  BrainCircuit,
  Loader2,
  AlertCircle,
  Lightbulb,
  Sparkles,
  History,
  ShieldAlert,
  Database,
  RefreshCw,
} from 'lucide-react'

import {
  searchIncidents,
  reflectIncidents,
  getIncidents,
} from '../api/api'


function AIMemory() {

  const [query, setQuery] = useState('')

  const [memories, setMemories] = useState([])

  const [insights, setInsights] = useState('')

  const [currentIncidents, setCurrentIncidents] = useState([])

  const [searchLoading, setSearchLoading] = useState(false)

  const [reflectLoading, setReflectLoading] = useState(false)

  const [incidentLoading, setIncidentLoading] = useState(false)

  const [error, setError] = useState('')

  const [searched, setSearched] = useState(false)


  // LOAD CURRENT INCIDENTS FROM SQLITE
  const loadCurrentIncidents = async () => {

    try {

      setIncidentLoading(true)

      const data = await getIncidents()

      setCurrentIncidents(data.incidents || [])

    } catch (err) {

      console.error('Unable to load current incidents:', err)

      setError('Unable to load current SQLite incidents.')

    } finally {

      setIncidentLoading(false)

    }

  }


  useEffect(() => {

    loadCurrentIncidents()

  }, [])


  // SEARCH HISTORICAL HINDSIGHT MEMORIES
  const handleSearch = async (e) => {

    e.preventDefault()

    if (query.trim().length < 3) {

      setError('Enter at least 3 characters.')

      return

    }

    try {

      setSearchLoading(true)

      setError('')

      setSearched(true)

      const data = await searchIncidents(query)

      setMemories(data.memories || [])

    } catch (err) {

      console.error(err)

      setError('Unable to retrieve Hindsight memories.')

      setMemories([])

    } finally {

      setSearchLoading(false)

    }

  }


  // GENERATE AI REFLECTION
  const handleReflection = async () => {

    if (query.trim().length < 3) {

      setError('Enter a search query before generating insights.')

      return

    }

    try {

      setReflectLoading(true)

      setError('')

      setInsights('')

      const data = await reflectIncidents(query)

      setInsights(data.answer || 'No insights returned.')

    } catch (err) {

      console.error(err)

      setError('Unable to generate AI insights.')

    } finally {

      setReflectLoading(false)

    }

  }


  // SEVERITY COLOR
  const getSeverityColor = (severity) => {

    switch (severity?.toLowerCase()) {

      case 'critical':
        return 'text-red-400 bg-red-500/10'

      case 'high':
        return 'text-orange-400 bg-orange-500/10'

      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10'

      default:
        return 'text-slate-400 bg-slate-500/10'

    }

  }


  return (

    <div className="space-y-8">


      {/* PAGE HEADER */}

      <div>

        <div className="flex items-center gap-3">

          <BrainCircuit
            size={30}
            className="text-cyan-400"
          />

          <h1 className="text-3xl font-bold">
            AI Memory Intelligence
          </h1>

        </div>

        <p className="mt-2 text-slate-400">
          Explore historical incident knowledge and AI-generated insights.
        </p>

      </div>


      {/* MEMORY SEARCH */}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-5 flex items-center gap-3">

          <div className="rounded-lg bg-cyan-500/10 p-3">

            <Search
              size={24}
              className="text-cyan-400"
            />

          </div>

          <div>

            <h2 className="text-lg font-semibold">
              Hindsight Memory Search
            </h2>

            <p className="text-sm text-slate-400">
              Retrieve knowledge from previously stored incidents.
            </p>

          </div>

        </div>


        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Payment Service database connection timeout"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />


          <button
            type="submit"
            disabled={searchLoading}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >

            {searchLoading ? (

              <Loader2
                size={18}
                className="animate-spin"
              />

            ) : (

              <Search size={18} />

            )}

            Search Memories

          </button>

        </form>


        <button
          onClick={handleReflection}
          disabled={reflectLoading}
          className="mt-4 flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
        >

          {reflectLoading ? (

            <Loader2
              size={18}
              className="animate-spin"
            />

          ) : (

            <Sparkles size={18} />

          )}

          Generate AI Insights

        </button>


        {error && (

          <div className="mt-4 flex items-center gap-2 text-sm text-red-400">

            <AlertCircle size={18} />

            {error}

          </div>

        )}

      </section>


      {/* AI GENERATED INSIGHTS */}

      {insights && (

        <section className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 to-slate-900 p-6">

          <div className="mb-6 flex items-center gap-3">

            <div className="rounded-lg bg-purple-500/20 p-3">

              <Lightbulb
                size={25}
                className="text-purple-400"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold">
                AI Memory Insights
              </h2>

              <p className="text-sm text-slate-400">
                Knowledge synthesized from historical incidents.
              </p>

            </div>

          </div>


          {/* MARKDOWN RENDERING */}

          <div className="prose prose-invert max-w-none
            prose-headings:text-purple-300
            prose-h2:mt-6 prose-h2:text-xl
            prose-h3:mt-5 prose-h3:text-lg
            prose-p:text-slate-300
            prose-li:text-slate-300
            prose-strong:text-white
            prose-ol:pl-6 prose-ul:pl-6
            prose-hr:border-slate-700
          ">

            <ReactMarkdown remarkPlugins={[remarkGfm]}>

              {insights}

            </ReactMarkdown>

          </div>


          {/* SAFETY NOTICE */}

          <div className="mt-7 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">

            <div className="flex items-center gap-2 text-yellow-400">

              <ShieldAlert size={19} />

              <h3 className="font-semibold">
                Production Safety
              </h3>

            </div>

            <p className="mt-2 text-sm leading-6 text-slate-300">

              Historical resolutions are not automatically valid for
              current incidents. Verify the root cause independently.
              All production changes require engineer approval.

            </p>

          </div>

        </section>

      )}


      {/* HISTORICAL MEMORIES */}

      {searched && !searchLoading && (

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-5 flex items-center gap-3">

            <History
              size={23}
              className="text-cyan-400"
            />

            <h2 className="text-xl font-semibold">
              Historical Memories ({memories.length})
            </h2>

          </div>


          {memories.length === 0 ? (

            <p className="text-slate-400">
              No relevant historical memories found.
            </p>

          ) : (

            <div className="space-y-3">

              {memories.map((memory, index) => (

                <div
                  key={index}
                  className="rounded-lg border border-slate-800 bg-slate-950 p-4"
                >

                  <div className="mb-2 flex items-center gap-2">

                    <BrainCircuit
                      size={17}
                      className="text-cyan-400"
                    />

                    <span className="text-xs font-semibold text-cyan-400">
                      HISTORICAL MEMORY #{index + 1}
                    </span>

                  </div>

                  <p className="text-sm leading-7 text-slate-300">
                    {memory}
                  </p>

                </div>

              ))}

            </div>

          )}

        </section>

      )}


      {/* CURRENT INCIDENTS FROM SQLITE */}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">

        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-emerald-500/10 p-3">

              <Database
                size={23}
                className="text-emerald-400"
              />

            </div>

            <div>

              <h2 className="text-xl font-semibold">
                Current Incident Records
              </h2>

              <p className="text-sm text-slate-400">
                Live records retrieved from SQLite.
              </p>

            </div>

          </div>


          <button
            onClick={loadCurrentIncidents}
            disabled={incidentLoading}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
          >

            <RefreshCw
              size={16}
              className={incidentLoading ? 'animate-spin' : ''}
            />

            Refresh

          </button>

        </div>


        {incidentLoading ? (

          <p className="py-6 text-center text-slate-400">
            Loading current incidents...
          </p>

        ) : currentIncidents.length === 0 ? (

          <p className="py-6 text-center text-slate-400">
            No current incident records found.
          </p>

        ) : (

          <div className="space-y-3">

            {currentIncidents.map((incident) => (

              <div
                key={incident.incident_id}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >

                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                  <div>

                    <p className="font-semibold text-cyan-400">
                      {incident.incident_id}
                    </p>

                    <p className="mt-1 text-sm text-white">
                      {incident.service}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {incident.problem}
                    </p>

                  </div>


                  <div className="flex flex-wrap items-center gap-2">

                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                      {incident.severity || 'Unknown'}
                    </span>

                    <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                      {incident.outcome || 'Pending'}
                    </span>

                  </div>

                </div>


                <div className="mt-4 border-t border-slate-800 pt-3">

                  <p className="text-xs text-slate-500">
                    Recorded root cause:
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {incident.root_cause || 'Not yet confirmed'}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* FOOTER SAFETY MESSAGE */}

      <div className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">

        <ShieldAlert
          className="mt-1 shrink-0 text-yellow-400"
          size={20}
        />

        <p className="text-xs leading-6 text-slate-400">

          RECALLOPS separates historical knowledge from current incident
          records. AI-generated hypotheses and recommendations are not
          verified facts. Human approval is required before production
          changes.

        </p>

      </div>


    </div>

  )

}


export default AIMemory