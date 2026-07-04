import { useEffect, useRef, useState } from 'react'
import { PageHeader, Card, StatCard, AIBadge, ScoreBar, StatusPill, Button } from '../components/ui'
import {
  permitApplications,
  permitStages,
  citizenTracker,
  chatbotScript,
  quickReplies,
} from '../data/permits'
import type { ChatMessage, PermitStage } from '../types'
import { confidenceColor } from '../lib/colors'
import { cx, formatDate, formatPct } from '../lib/format'

// --- small inline icons ----------------------------------------------------

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

// --- static labels & derived stats ----------------------------------------

const STAGE_LABELS: Record<PermitStage, string> = {
  submitted: 'Submitted',
  'pre-screening': 'Pre-screening',
  'compliance-review': 'Compliance review',
  inspection: 'Inspection',
  decision: 'Decision',
  approved: 'Approved',
  rejected: 'Rejected',
}

const totalFlags = permitApplications.reduce(
  (n, a) => n + a.compliance.filter((c) => c.status === 'flag').length,
  0,
)
const avgScore = permitApplications.reduce((s, a) => s + a.aiPreScreenScore, 0) / permitApplications.length
const inPipeline = permitApplications.filter(
  (a) => a.stage === 'pre-screening' || a.stage === 'compliance-review',
).length

// Canned 24/7 assistant replies (simulated), tied to the sample application.
const cannedReplies: Record<string, string> = {
  'What documents are missing?':
    'For APP-2026-0418 two documents are outstanding: the Environmental Compliance Certificate (not attached) and a valid Barangay clearance (the 2025 copy has expired). Re-upload both to keep your timeline on track.',
  'Who is my assigned officer?':
    'Your reviewing officer is Eng. P. Ramos at the Permits & Zoning desk. You can reply here any time — I am available 24/7 — and I will route detailed cases to Eng. Ramos during office hours.',
  'How do I appeal a decision?':
    'If a decision is unfavourable you may file a written appeal within 15 days through the Citizen Portal. I can pre-fill an appeal form referencing APP-2026-0418 and the specific findings — just say “start appeal”.',
}

interface ActionResult {
  kind: 'approve' | 'override'
  text: string
}

export default function Permits() {
  const [selectedId, setSelectedId] = useState<string>(permitApplications[0].id)
  const [action, setAction] = useState<ActionResult | null>(null)
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [overrideNote, setOverrideNote] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>(chatbotScript)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const selected = permitApplications.find((a) => a.id === selectedId) ?? permitApplications[0]
  const scoreColor = confidenceColor(selected.aiPreScreenScore)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  function handleSelect(id: string) {
    setSelectedId(id)
    setAction(null)
    setOverrideOpen(false)
    setOverrideNote('')
  }

  function approve() {
    setOverrideOpen(false)
    setAction({
      kind: 'approve',
      text: `${selected.ref} approved — decision recorded to the audit trail and the applicant has been notified.`,
    })
  }

  function recordOverride() {
    const note = overrideNote.trim()
    if (!note) return
    setAction({
      kind: 'override',
      text: `Flag override for ${selected.ref} recorded to the audit trail: “${note}”`,
    })
    setOverrideOpen(false)
    setOverrideNote('')
  }

  function sendQuick(q: string) {
    const reply =
      cannedReplies[q] ??
      'Thanks for your question — a permits officer will follow up within one business day. (Simulated assistant.)'
    setMessages((prev) => [...prev, { from: 'citizen', text: q }, { from: 'ai', text: reply }])
  }

  return (
    <div>
      <PageHeader
        title="Permits & Applications"
        description="AI pre-screening and automated zoning-compliance triage, with a 24/7 citizen status portal."
        stories="US-007 · 008 · 009"
      />

      <div className="px-6 pb-8 space-y-5">
        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active applications" value={String(permitApplications.length)} delta={12.5} />
          <StatCard label="In review pipeline" value={String(inPipeline)} />
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <AIBadge /> Open zoning flags
            </div>
            <div className="mt-1 text-2xl font-bold text-amber-600">{totalFlags}</div>
            <div className="text-xs text-gray-400 mt-1">awaiting officer review</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <AIBadge /> Avg pre-screen score
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: confidenceColor(avgScore) }}>
              {formatPct(avgScore)}
            </div>
            <div className="text-xs text-gray-400 mt-1">across {permitApplications.length} applications</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          {/* LEFT: pipeline + detail */}
          <div className="xl:col-span-2 space-y-5">
            <Card
              title="Application pipeline"
              subtitle="AI pre-screening & zoning-compliance triage"
              right={<AIBadge label="AI triage" title="Stage routing assisted by simulated AI" />}
              bodyClassName="p-3"
            >
              <div className="flex gap-3 overflow-x-auto pb-1 scroll-thin">
                {permitStages.map((stage) => {
                  const apps = permitApplications.filter((a) => a.stage === stage)
                  return (
                    <div key={stage} className="w-60 shrink-0">
                      <div className="flex items-center justify-between px-1 mb-2">
                        <span className="text-xs font-semibold text-gray-600">{STAGE_LABELS[stage]}</span>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                          {apps.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {apps.length === 0 && (
                          <div className="text-[11px] text-gray-400 italic px-1 py-3 text-center border border-dashed border-gray-200 rounded-lg">
                            No applications
                          </div>
                        )}
                        {apps.map((a) => {
                          const active = a.id === selectedId
                          const flags = a.compliance.filter((c) => c.status === 'flag').length
                          return (
                            <button
                              key={a.id}
                              onClick={() => handleSelect(a.id)}
                              className={cx(
                                'w-full text-left rounded-lg border p-2.5 transition-colors',
                                active
                                  ? 'border-brand bg-brand-light/50 ring-1 ring-brand'
                                  : 'border-gray-200 bg-white hover:border-brand/50 hover:bg-gray-50',
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-mono font-semibold text-brand">{a.ref}</span>
                                {flags > 0 && (
                                  <span className="text-[10px] font-semibold text-red-700 bg-red-100 rounded-full px-1.5">
                                    {flags} flag{flags > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 text-sm font-medium text-gray-800 leading-tight">{a.applicant}</div>
                              <div className="text-[11px] text-gray-500 leading-tight">{a.type}</div>
                              <div className="mt-1 text-[10px] font-mono text-gray-400">{a.parcelRef}</div>
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                  <span className="inline-flex items-center gap-1 text-gray-500">
                                    <AIBadge /> pre-screen
                                  </span>
                                  <span className="font-semibold" style={{ color: confidenceColor(a.aiPreScreenScore) }}>
                                    {formatPct(a.aiPreScreenScore)}
                                  </span>
                                </div>
                                <ScoreBar value={a.aiPreScreenScore * 100} color={confidenceColor(a.aiPreScreenScore)} />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Detail panel */}
            <Card
              title={<span className="font-mono text-brand">{selected.ref}</span>}
              subtitle={selected.type}
              right={<StatusPill status={selected.stage} label={STAGE_LABELS[selected.stage]} />}
            >
              {/* Header facts */}
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5">
                {[
                  ['Applicant', selected.applicant],
                  ['Parcel', selected.parcelRef],
                  ['Officer', selected.officer],
                  ['Submitted', formatDate(selected.submittedOn)],
                  ['Est. completion', formatDate(selected.estCompletion)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[11px] uppercase tracking-wide text-gray-400">{label}</dt>
                    <dd className="text-sm text-gray-800 mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>

              {/* US-007 AI pre-screening */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    AI pre-screening <AIBadge title="US-007 · simulated completeness estimate" />
                  </h4>
                  <span className="text-sm font-bold" style={{ color: scoreColor }}>
                    {formatPct(selected.aiPreScreenScore)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Document completeness & readiness estimate (US-007).</p>
                <div className="mt-2">
                  <ScoreBar value={selected.aiPreScreenScore * 100} color={scoreColor} />
                </div>
                <ul className="mt-3 space-y-1.5">
                  {selected.checklist.map((c) => (
                    <li key={c.label} className="flex items-start gap-2 text-sm">
                      <span
                        className={cx(
                          'mt-0.5 grid place-items-center w-4 h-4 rounded-full shrink-0',
                          c.ok ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
                        )}
                      >
                        {c.ok ? <CheckIcon /> : <XIcon />}
                      </span>
                      <span className={cx(c.ok ? 'text-gray-700' : 'text-gray-800')}>
                        {c.label}
                        {!c.ok && c.note && <span className="text-red-600 text-xs"> — {c.note}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* US-008 Zoning compliance */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  Zoning compliance <AIBadge title="US-008 · automated zoning-compliance check" />
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">Automated check against zoning & development regulations (US-008).</p>
                <ul className="mt-3 space-y-2">
                  {selected.compliance.map((c) => (
                    <li key={c.item} className="rounded-lg border border-gray-100 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-gray-700">{c.item}</span>
                        <StatusPill status={c.status} />
                      </div>
                      {c.status === 'flag' && (
                        <div className="mt-1.5 rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
                          {c.regulation && <span className="font-semibold">{c.regulation}: </span>}
                          {c.detail}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button onClick={approve}>Approve</Button>
                  <Button variant="secondary" onClick={() => setOverrideOpen((v) => !v)}>
                    Override flag (with note)
                  </Button>
                </div>

                {overrideOpen && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <label className="text-xs font-medium text-gray-600">
                      Override justification <span className="text-gray-400">(recorded to audit trail)</span>
                    </label>
                    <textarea
                      value={overrideNote}
                      onChange={(e) => setOverrideNote(e.target.value)}
                      rows={2}
                      placeholder="e.g. Open-space shortfall offset by adjacent public park; cleared by zoning board."
                      className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={recordOverride} disabled={!overrideNote.trim()}>
                        Record override
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setOverrideOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {action && (
                  <div
                    className={cx(
                      'mt-3 rounded-lg border p-2.5 text-sm flex items-start gap-2',
                      action.kind === 'approve'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800',
                    )}
                  >
                    <span className="mt-0.5 shrink-0">
                      <CheckIcon />
                    </span>
                    <span>{action.text}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT: citizen portal */}
          <div className="space-y-5">
            {/* Track my application */}
            <Card title="Track my application" subtitle="Citizen portal · US-009">
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <div className="font-mono text-sm font-semibold text-brand">{citizenTracker.ref}</div>
                <div className="text-sm text-gray-800 mt-0.5">{citizenTracker.type}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Officer</div>
                    <div className="text-gray-700">{citizenTracker.officer}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Est. completion</div>
                    <div className="text-gray-700">{formatDate(citizenTracker.estCompletion)}</div>
                  </div>
                </div>
              </div>

              <ol className="mt-4">
                {citizenTracker.timeline.map((step, i) => {
                  const last = i === citizenTracker.timeline.length - 1
                  return (
                    <li key={step.stage} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cx(
                            'grid place-items-center w-6 h-6 rounded-full shrink-0',
                            step.done ? 'bg-brand text-white' : 'bg-gray-100 text-gray-300 border border-gray-200',
                          )}
                        >
                          {step.done ? <CheckIcon /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
                        </span>
                        {!last && (
                          <span className={cx('w-0.5 flex-1 min-h-[20px]', step.done ? 'bg-brand' : 'bg-gray-200')} />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className={cx('text-sm font-medium', step.done ? 'text-gray-800' : 'text-gray-500')}>
                          {step.stage}
                        </div>
                        <div className="text-xs text-gray-400">{step.date}</div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </Card>

            {/* Chatbot */}
            <Card
              title="Ask the AI assistant"
              subtitle="24/7 citizen helper · US-009"
              right={<AIBadge title="Simulated assistant" />}
            >
              <div className="space-y-3 max-h-72 overflow-y-auto scroll-thin pr-1">
                {messages.map((m, i) =>
                  m.from === 'ai' ? (
                    <div key={i} className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AIBadge />
                        <span className="text-[10px] text-gray-400">Assistant</span>
                      </div>
                      <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-brand-light text-gray-800 px-3 py-2 text-sm leading-snug">
                        {m.text}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-gray-100 text-gray-700 px-3 py-2 text-sm leading-snug">
                        {m.text}
                      </div>
                    </div>
                  ),
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="text-[11px] text-gray-400 mb-1.5">Quick questions</div>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((q) => (
                    <Button key={q} size="sm" variant="ghost" onClick={() => sendQuick(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
