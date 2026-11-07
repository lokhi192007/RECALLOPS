import { useState } from 'react'
import {
  AlertTriangle,
  BrainCircuit,
  Send,
  Search,
  History,
  Database,
  ChevronDown,
} from 'lucide-react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import {
  analyzeIncident,
  analyzeIncidentSimilarity,
} from '../api/api'

function NewIncident() {
  const [form, setForm] = useState({
    incident_id: `INC-${Date.now()}`,
    service: '',
    problem: '',
    symptoms: '',
    root_cause: null,
    resolution: null,
    outcome: null,
    severity: 'High',
  })

  const [loading, setLoading] = useState(false)
  const [similarityLoading, setSimilarityLoading] = useState(false)

  const [result, setResult] = useState(null)
  const [similarityResult, setSimilarityResult] = useState(null)

  const [error, setError] = useState('')
  const [similarityError, setSimilarityError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setSimilarityResult(null)
    setSimilarityError('')
  }

  // Normal incident analysis
  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const analysisResult = await analyzeIncident(form)
      setResult(analysisResult)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to analyze incident. Check your backend server.'
      )
    } finally {
      setLoading(false)
    }
  }

  // AI-powered historical similarity analysis
  const handleSimilarityAnalysis = async () => {
    if (
      !form.service.trim() ||
      !form.problem.trim() ||
      !form.symptoms.trim()
    ) {
      setSimilarityError(
        'Please enter the service name, problem description and symptoms first.'
      )
      return
    }

    setSimilarityLoading(true)
    setSimilarityError('')
    setSimilarityResult(null)

    try {
      const response = await analyzeIncidentSimilarity({
        service: form.service,
        problem: form.problem,
        symptoms: form.symptoms,
      })

      setSimilarityResult(response)
    } catch (err) {
      setSimilarityError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to find similar incidents.'
      )
    } finally {
      setSimilarityLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold">New Incident</h2>

        <p className="mt-2 text-sm text-slate-400">
          Submit an incident and let RECALLOPS investigate using
          historical memory.
        </p>
      </div>

      {/* Incident Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
      >

        {/* Incident ID */}
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Incident ID
          </label>

          <input
            value={form.incident_id}
            readOnly
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-400"
          />
        </div>

        {/* Service Name */}
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Service Name
          </label>

          <input
            name="service"
            value={form.service}
            onChange={handleChange}
            placeholder="Example: Authentication Service"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Problem */}
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Problem Description
          </label>

          <input
            name="problem"
            value={form.problem}
            onChange={handleChange}
            placeholder="Example: Database connection timeout"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Symptoms */}
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Symptoms
          </label>

          <textarea
            name="symptoms"
            value={form.symptoms}
            onChange={handleChange}
            placeholder="Describe what users are experiencing..."
            rows="4"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Severity
          </label>

          <select
            name="severity"
            value={form.severity}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Analyze Incident Button */}
        <button
          type="submit"
          disabled={loading || similarityLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <BrainCircuit size={19} className="animate-pulse" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Send size={18} />
              Analyze Incident
            </>
          )}
        </button>

        {/* Similarity Analysis Button */}
        <button
          type="button"
          onClick={handleSimilarityAnalysis}
          disabled={loading || similarityLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-purple-500 bg-purple-500/10 px-5 py-3 font-semibold text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {similarityLoading ? (
            <>
              <BrainCircuit size={19} className="animate-pulse" />
              Searching Historical Incidents...
            </>
          ) : (
            <>
              <Search size={18} />
              Find Similar Incidents
            </>
          )}
        </button>

      </form>

      {/* Incident Analysis Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle className="mr-2 inline" size={17} />
          {error}
        </div>
      )}

      {/* Similarity Analysis Error */}
      {similarityError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle className="mr-2 inline" size={17} />
          {similarityError}
        </div>
      )}

      {/* Normal Incident Analysis Result */}
      {result && (
        <div className="space-y-5">

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <h3 className="font-semibold text-emerald-400">
              AI Analysis Completed
            </h3>

            <p className="mt-1 text-sm text-slate-300">
              Incident: {result.incident_id}
            </p>
          </div>

          {/* Historical Memories */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-cyan-400">
              <BrainCircuit size={20} />
              Historical Memories
            </h3>

            {result.historical_memories?.length ? (
              <ul className="list-disc space-y-3 pl-5 text-sm text-slate-300">
                {result.historical_memories.map((memory, index) => (
                  <li key={index}>{memory}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No relevant historical memories found.
              </p>
            )}
          </div>

          {/* Groq Incident Analysis */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="mb-4 font-semibold text-cyan-400">
              Groq AI Incident Analysis
            </h3>

            <div className="prose prose-invert max-w-none text-sm leading-7">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.analysis || ''}
              </ReactMarkdown>
            </div>
          </div>

        </div>
      )}

      {/* AI Similarity Analysis Result */}
      {similarityResult && (
        <div className="space-y-5">

          {/* Similarity Header */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">

            <h3 className="flex items-center gap-2 text-lg font-bold text-purple-300">
              <History size={22} />
              AI Historical Similarity Analysis
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              Service: {similarityResult.service}
            </p>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
              <span>
                Retrieved records:{' '}
                {similarityResult.retrieved_memory_records ?? 0}
              </span>

              <span>
                Selected memories:{' '}
                {similarityResult.memories_used_for_analysis ?? 0}
              </span>
            </div>

            <div className="mt-3 text-xs text-purple-200">
              Powered by Hindsight Memory + Groq AI
            </div>

          </div>

          {/* AI Similarity Report */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h3 className="mb-5 flex items-center gap-2 font-semibold text-cyan-400">
              <BrainCircuit size={21} />
              Similarity Intelligence Report
            </h3>

            <div className="prose prose-invert max-w-none text-sm leading-7 prose-headings:text-cyan-300 prose-strong:text-white prose-table:text-slate-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {similarityResult.analysis || 'No analysis available.'}
              </ReactMarkdown>
            </div>

          </div>

          {/* Historical Evidence */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900 p-6">

            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-cyan-400">
              <Database size={21} />
              Historical Evidence
            </h3>

            <p className="mb-5 text-sm text-slate-400">
              Original memory records retrieved from Hindsight.
              Expand a reference to inspect its source content.
            </p>

            {similarityResult.memory_evidence?.length > 0 ? (

              <div className="space-y-3">

                {similarityResult.memory_evidence.map((memory) => (

                  <details
                    key={memory.reference}
                    className="group rounded-lg border border-slate-700 bg-slate-950"
                  >

                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">

                      <div className="flex items-center gap-3">

                        <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                          {memory.reference}
                        </span>

                        <span className="text-sm font-medium text-slate-200">
                          Historical Memory Record
                        </span>

                      </div>

                      <ChevronDown
                        size={18}
                        className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      />

                    </summary>

                    <div className="border-t border-slate-800 px-4 py-4">

                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {memory.content}
                      </p>

                    </div>

                  </details>

                ))}

              </div>

            ) : (

              <p className="rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-500">
                No historical evidence records were returned by the backend.
              </p>

            )}

          </div>

          {/* Safety Notice */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">

            <AlertTriangle size={18} className="mr-2 inline" />

            Historical similarity does not prove the current root cause.
            AI-generated hypotheses must be verified against actual logs,
            metrics and system evidence. Obtain engineer approval before
            applying production changes.

          </div>

        </div>
      )}

    </div>
  )
}

export default NewIncident