import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import {
  PageHeader,
  Card,
  StatCard,
  AIBadge,
  Button,
  Modal,
  ScoreBar,
  StatusPill,
} from '../components/ui'
import {
  communityImpacts,
  indigenousZones,
  consultationCases,
  consultationStages,
} from '../data/community'
import { parcels, REGION_CENTER } from '../data/parcels'
import type { ConsultationCase, CommunityImpact } from '../types'
import { cx, formatDate } from '../lib/format'

// --- helpers ---------------------------------------------------------------

/** Green / amber / red band for a 0..100 impact score. */
function bandColor(v: number): string {
  if (v >= 66) return '#16a34a'
  if (v >= 45) return '#eab308'
  return '#dc2626'
}

function stageLabel(s: string): string {
  const t = s.replace(/-/g, ' ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

type Sentiment = 'support' | 'concern' | 'neutral'

const SENTIMENT_STYLE: Record<Sentiment, string> = {
  support: 'bg-green-100 text-green-700',
  concern: 'bg-amber-100 text-amber-700',
  neutral: 'bg-gray-100 text-gray-600',
}

/** Mock portal feedback, used by the "View community feedback" modal. */
const SAMPLE_FEEDBACK: Record<string, { name: string; text: string; sentiment: Sentiment }[]> = {
  ci1: [
    { name: 'Aling Rosa · Purok 3', sentiment: 'concern', text: 'We need more housing, but our street already floods every storm. Please fix the drainage before building.' },
    { name: 'Brgy. Kagawad Lito', sentiment: 'support', text: 'Jobs for our youth are very welcome. We hope local workers get priority during construction.' },
    { name: 'San Isidro Parish council', sentiment: 'concern', text: 'The chapel is only 700 m away — kindly keep heavy trucks off the chapel road on Sundays.' },
    { name: 'PTA · Malinao Elementary', sentiment: 'concern', text: 'Worried about children crossing near the proposed entrance road.' },
  ],
  ci2: [
    { name: 'Public Market Vendors Assoc.', sentiment: 'support', text: 'More foot traffic is good for our stalls. We are in favour of the complex.' },
    { name: 'Day-care parents group', sentiment: 'concern', text: 'Traffic near the day-care is already bad. We need a clear traffic plan and a crossing guard.' },
    { name: 'Jeepney Operators · Terminal 2', sentiment: 'support', text: 'A terminal upgrade would help commuters and drivers alike. Supportive.' },
  ],
}

/** Plain-language framing of each AI impact summary. */
const PLAIN_FRAMING: Record<string, string> = {
  ci1: 'This project would bring jobs and local business, but it sits close to the river and could affect the water supply and flooding. Safeguards are recommended before it goes ahead.',
  ci2: 'Good for local business and easy to reach by public transport. The main worry is extra traffic near the day-care, so a traffic-management plan should be required.',
}

const ZONE = indigenousZones[0]

export default function Community() {
  // Consultation cases are mutable: the FPIC workflow prepends new ones.
  const [cases, setCases] = useState<ConsultationCase[]>(consultationCases)
  const [triggerOpen, setTriggerOpen] = useState(false)
  const [feedbackFor, setFeedbackFor] = useState<CommunityImpact | null>(null)
  const [shared, setShared] = useState<string[]>([])

  const overlapParcels = useMemo(() => parcels.filter((p) => p.indigenousOverlap), [])
  const [selectedRef, setSelectedRef] = useState(overlapParcels[0]?.ref ?? '')
  const [createdCount, setCreatedCount] = useState(0)

  const totalFeedback = communityImpacts.reduce((a, c) => a + c.feedbackCount, 0)
  const activeConsultations = cases.filter((c) => c.stage !== 'resolved').length

  function confirmTrigger() {
    const newCase: ConsultationCase = {
      id: `cc-new-${Date.now()}`,
      applicationRef: `APP-2026-05${String(createdCount).padStart(2, '0')}`,
      zoneName: ZONE?.name ?? 'Ancestral Domain',
      triggeredOn: '2026-06-27',
      stage: 'notified',
      liaison: 'NCIP Liaison — R. Mercado',
      notes: `Application on ${selectedRef} overlaps the recognised ${ZONE?.name ?? 'ancestral domain'} (${ZONE?.claimRef ?? ''}). FPIC consultation is mandatory and the NCIP liaison has been notified automatically. The application is on hold pending Free, Prior & Informed Consent.`,
    }
    setCases((prev) => [newCase, ...prev])
    setCreatedCount((n) => n + 1)
    setTriggerOpen(false)
  }

  function toggleShared(id: string) {
    setShared((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <>
      <PageHeader
        title="Community & Indigenous Engagement"
        description="AI-assisted community impact assessment and automatic enforcement of indigenous land-rights consultation (FPIC) for any application overlapping a recognised ancestral domain."
        stories="US-012 · 013"
      />

      <div className="px-6 pb-10 space-y-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Projects assessed" value={String(communityImpacts.length)} />
          <StatCard label="Community feedback collected" value={String(totalFeedback)} unit="submissions" />
          <StatCard label="Parcels overlapping ancestral domain" value={String(overlapParcels.length)} />
          <StatCard label="Active FPIC consultations" value={String(activeConsultations)} delta={50} />
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* US-012 — Community impact assessment                             */}
        {/* ---------------------------------------------------------------- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-gray-700">Community impact assessment</h2>
            <span className="text-[11px] font-medium text-brand bg-brand-light rounded-full px-2 py-0.5">US-012</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {communityImpacts.map((ci) => (
              <Card
                key={ci.id}
                title={ci.project}
                subtitle={`Parcel ${ci.parcelRef}`}
                right={<AIBadge label="AI impact" title="Simulated AI impact assessment" />}
              >
                {/* Impact scores */}
                <div className="space-y-3">
                  {(
                    [
                      ['Social impact', ci.social],
                      ['Environmental impact', ci.environmental],
                      ['Economic impact', ci.economic],
                    ] as const
                  ).map(([label, value]) => {
                    const color = bandColor(value)
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-semibold" style={{ color }}>
                            {value}
                            <span className="text-gray-400 font-normal">/100</span>
                          </span>
                        </div>
                        <ScoreBar value={value} color={color} />
                      </div>
                    )
                  })}
                </div>

                {/* Proximity */}
                <div className="mt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nearby sensitive features
                  </div>
                  <ul className="space-y-1">
                    {ci.proximity.map((p) => (
                      <li key={p.feature} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{p.feature}</span>
                        <span className="text-gray-500 tabular-nums">{p.distanceKm} km</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI summary + plain-language framing */}
                <div className="mt-4 rounded-lg bg-violet-50/60 border border-violet-100 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AIBadge label="AI summary" />
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{ci.summary}</p>
                  <div className="mt-2 pt-2 border-t border-violet-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AIBadge label="Plain language" title="AI-simplified, plain-language summary" />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{PLAIN_FRAMING[ci.id]}</p>
                  </div>
                </div>

                {/* Feedback + actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{ci.feedbackCount}</span> community submissions
                  </span>
                  <div className="flex-1" />
                  <Button size="sm" variant="secondary" onClick={() => setFeedbackFor(ci)}>
                    View community feedback
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleShared(ci.id)}>
                    Share in local language
                  </Button>
                </div>
                {shared.includes(ci.id) && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-green-700">
                    <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 font-medium">
                      Shared · Tagalog &amp; Dumagat
                    </span>
                    <AIBadge label="AI translated" title="Mock AI translation" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* US-013 — Indigenous land-rights overlay (centrepiece)            */}
        {/* ---------------------------------------------------------------- */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold text-gray-700">Indigenous land-rights overlay</h2>
            <span className="text-[11px] font-medium text-brand bg-brand-light rounded-full px-2 py-0.5">US-013</span>
            <AIBadge label="AI overlap detection" title="Parcel / ancestral-domain overlap detected by simulated AI spatial analysis" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Map */}
            <Card
              className="xl:col-span-2"
              title="Ancestral domain overlay"
              subtitle="Recognised ancestral domains drawn over the district cadastre. Overlapping parcels are flagged automatically."
              bodyClassName="p-0"
            >
              <div className="relative h-[560px] rounded-b-xl overflow-hidden border-t border-gray-200">
                <MapContainer center={REGION_CENTER} zoom={14} className="h-full w-full">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {/* All parcels — light gray; overlapping parcels in amber */}
                  {parcels.map((p) => (
                    <Polygon
                      key={p.id}
                      positions={p.ring}
                      pathOptions={
                        p.indigenousOverlap
                          ? { color: '#f59e0b', weight: 2, fillColor: '#fbbf24', fillOpacity: 0.35 }
                          : { color: '#9ca3af', weight: 1, fillColor: '#e5e7eb', fillOpacity: 0.35 }
                      }
                    >
                      {p.indigenousOverlap && (
                        <Tooltip>
                          <span className="text-xs">
                            {p.ref} · overlaps ancestral domain
                          </span>
                        </Tooltip>
                      )}
                    </Polygon>
                  ))}

                  {/* Indigenous ancestral domains — purple */}
                  {indigenousZones.map((z) => (
                    <Polygon
                      key={z.id}
                      positions={z.ring}
                      pathOptions={{ color: '#7c3aed', weight: 2, fillColor: '#7c3aed', fillOpacity: 0.25 }}
                    >
                      <Tooltip sticky>
                        <div className="text-xs">
                          <div className="font-semibold">{z.name}</div>
                          <div className="text-gray-500">{z.claimRef}</div>
                        </div>
                      </Tooltip>
                    </Polygon>
                  ))}
                </MapContainer>

                {/* Legend */}
                <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-sm px-3 py-2 text-[11px] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm border border-gray-400" style={{ background: '#e5e7eb' }} />
                    <span className="text-gray-600">Parcel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm border-2 border-amber-500" style={{ background: '#fbbf24' }} />
                    <span className="text-gray-600">Overlaps ancestral domain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm border-2" style={{ borderColor: '#7c3aed', background: '#7c3aed40' }} />
                    <span className="text-gray-600">Recognised ancestral domain</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Mandatory consultation panel */}
            <Card
              title="Mandatory consultation"
              subtitle="Free, Prior & Informed Consent (FPIC)"
              className="xl:col-span-1"
              bodyClassName="p-0"
            >
              <div className="p-4 space-y-3">
                {/* Auto-trigger explainer */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <div className="font-semibold mb-0.5">Automatic &amp; mandatory</div>
                  Any application overlapping a recognised ancestral domain automatically triggers a mandatory FPIC
                  consultation and notifies the NCIP liaison. The application cannot proceed without consent.
                </div>

                <Button onClick={() => setTriggerOpen(true)}>
                  Trigger mandatory consultation workflow
                </Button>

                <div className="text-[11px] text-gray-400">
                  {cases.length} consultation case{cases.length === 1 ? '' : 's'} on record
                </div>
              </div>

              {/* Case list */}
              <div className="border-t border-gray-100 max-h-[460px] overflow-y-auto scroll-thin p-4 space-y-3">
                {cases.map((c) => (
                  <ConsultationCaseCard key={c.id} c={c} />
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FPIC trigger modal                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={triggerOpen}
        onClose={() => setTriggerOpen(false)}
        title="Trigger mandatory FPIC consultation"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTriggerOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmTrigger} disabled={!selectedRef}>
              Confirm &amp; notify liaison
            </Button>
          </>
        }
      >
        <p className="leading-relaxed">
          Under the indigenous land-rights rules, <span className="font-semibold">any application that overlaps a
          recognised ancestral domain</span> triggers a <span className="font-semibold">mandatory</span> Free, Prior &amp;
          Informed Consent (FPIC) consultation. This step is automatic and cannot be skipped — the application is placed
          on hold and the NCIP liaison is notified immediately.
        </p>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Overlapping application / parcel
          </label>
          <select
            value={selectedRef}
            onChange={(e) => setSelectedRef(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          >
            {overlapParcels.map((p) => (
              <option key={p.id} value={p.ref}>
                {p.ref} · {p.owner}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-400">
            Overlap with {ZONE?.name} ({ZONE?.claimRef}) detected by spatial analysis.
          </p>
        </div>

        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
          On confirm, a new consultation case is opened at the <span className="font-semibold">Notified</span> stage and
          assigned to <span className="font-semibold">NCIP Liaison — R. Mercado</span>.
        </div>
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Community feedback modal                                           */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={feedbackFor !== null}
        onClose={() => setFeedbackFor(null)}
        title={feedbackFor ? `Community feedback — ${feedbackFor.project}` : 'Community feedback'}
        footer={
          <Button variant="primary" onClick={() => setFeedbackFor(null)}>
            Close
          </Button>
        }
      >
        {feedbackFor && (
          <>
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <AIBadge label="AI sentiment" title="Sentiment grouping is a simulated AI output" />
              Showing a sample of {feedbackFor.feedbackCount} portal submissions.
            </div>
            <ul className="space-y-3">
              {(SAMPLE_FEEDBACK[feedbackFor.id] ?? []).map((f, i) => (
                <li key={i} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-800">{f.name}</span>
                    <span className={cx('rounded-full px-2 py-0.5 text-[10px] font-medium capitalize', SENTIMENT_STYLE[f.sentiment])}>
                      {f.sentiment}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">{f.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>
    </>
  )
}

// --- Consultation case card -------------------------------------------------

function ConsultationCaseCard({ c }: { c: ConsultationCase }) {
  const current = consultationStages.indexOf(c.stage)
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-sm text-gray-800">{c.applicationRef}</span>
        <StatusPill status={c.stage} />
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {c.zoneName} · triggered {formatDate(c.triggeredOn)}
      </div>

      {/* Vertical stepper */}
      <ol className="mt-3">
        {consultationStages.map((s, i) => {
          const done = i <= current
          const isLast = i === consultationStages.length - 1
          return (
            <li key={s} className="flex gap-2">
              <div className="flex flex-col items-center">
                <span
                  className={cx(
                    'w-5 h-5 rounded-full grid place-items-center text-[10px] font-bold shrink-0',
                    done ? 'bg-brand text-white' : 'bg-gray-200 text-gray-400',
                  )}
                >
                  {i < current ? '✓' : i + 1}
                </span>
                {!isLast && (
                  <span
                    className={cx('w-0.5 flex-1', i < current ? 'bg-brand' : 'bg-gray-200')}
                    style={{ minHeight: '0.6rem' }}
                  />
                )}
              </div>
              <span
                className={cx(
                  'text-xs pb-2',
                  i === current ? 'text-brand font-semibold' : done ? 'text-gray-600' : 'text-gray-400',
                )}
              >
                {stageLabel(s)}
                {i === current && <span className="ml-1 text-[10px] text-gray-400">(current)</span>}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-1 text-xs">
        <span className="text-gray-400">Liaison: </span>
        <span className="text-gray-700">{c.liaison}</span>
      </div>
      <p className="mt-1 text-xs text-gray-600 leading-relaxed">{c.notes}</p>

      {c.stage === 'notified' && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5">
          Action required · FPIC pending
        </div>
      )}
    </div>
  )
}
