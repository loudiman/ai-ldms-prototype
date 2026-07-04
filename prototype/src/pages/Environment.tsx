import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import {
  PageHeader,
  Card,
  StatCard,
  AIBadge,
  ConfidenceChip,
  StatusPill,
  SeverityTag,
  Button,
  Modal,
  ScoreBar,
} from '../components/ui'
import { soilReadings, deforestationAlerts, soilThresholds } from '../data/environment'
import { parcels, REGION_CENTER } from '../data/parcels'
import { severityColor, floodColor, landUseLabel } from '../lib/colors'
import { cx, formatHa, formatDate } from '../lib/format'
import type { FloodRisk } from '../types'

// NDVI swatch — vegetation density rendered as forest-green opacity.
function NdviSwatch({ value, caption }: { value: number; caption: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-lg border border-gray-200 grid place-items-center text-[10px] font-bold text-white/90"
        style={{ backgroundColor: `rgba(26, 92, 42, ${value})` }}
      >
        {value.toFixed(2)}
      </div>
      <span className="text-[10px] text-gray-500 uppercase tracking-wide">{caption}</span>
    </div>
  )
}

export default function Environment() {
  // --- US-004: soil health -------------------------------------------------
  const [soilRef, setSoilRef] = useState(soilReadings[0]?.parcelRef ?? '')
  const [reportNote, setReportNote] = useState<string | null>(null)
  const reading = soilReadings.find((r) => r.parcelRef === soilRef) ?? soilReadings[0]

  const th = soilThresholds
  const metrics = [
    {
      label: 'Soil pH',
      value: reading.ph.toFixed(1),
      unit: undefined as string | undefined,
      flagged: reading.ph < th.ph.min || reading.ph > th.ph.max,
      note: reading.ph < th.ph.min ? 'Below safe range' : 'Above safe range',
    },
    {
      label: 'Nitrogen',
      value: String(reading.nitrogen),
      unit: 'ppm',
      flagged: reading.nitrogen < th.nitrogen.min,
      note: 'Below safe threshold',
    },
    {
      label: 'Phosphorus',
      value: String(reading.phosphorus),
      unit: 'ppm',
      flagged: reading.phosphorus < th.phosphorus.min,
      note: 'Below safe threshold',
    },
    {
      label: 'Organic matter',
      value: reading.organicMatter.toFixed(1),
      unit: '%',
      flagged: reading.organicMatter < th.organicMatter.min,
      note: 'Below safe threshold',
    },
  ]

  // --- US-005: deforestation alerts ---------------------------------------
  const [alerts, setAlerts] = useState(() => deforestationAlerts.map((a) => ({ ...a })))
  const [selectedAlertId, setSelectedAlertId] = useState<string>(deforestationAlerts[0]?.id ?? '')
  const [escalateId, setEscalateId] = useState<string | null>(null)
  const escalating = escalateId ? alerts.find((a) => a.id === escalateId) ?? null : null
  const escalatingParcel = escalating ? parcels.find((p) => p.ref === escalating.parcelRef) : undefined

  function confirmEscalation() {
    if (!escalateId) return
    setAlerts((prev) => prev.map((a) => (a.id === escalateId ? { ...a, status: 'escalated' } : a)))
    setEscalateId(null)
  }

  // --- US-006: flood-risk zoning ------------------------------------------
  const floodOrder: FloodRisk[] = ['low', 'medium', 'high', 'extreme']
  const floodLabel: Record<FloodRisk, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    extreme: 'Extreme',
  }
  const floodCounts = floodOrder.map((risk) => ({
    risk,
    count: parcels.filter((p) => p.floodRisk === risk).length,
  }))
  const parcelTotal = parcels.length || 1
  const restrictedCount = floodCounts
    .filter((f) => f.risk === 'high' || f.risk === 'extreme')
    .reduce((s, f) => s + f.count, 0)

  return (
    <>
      <PageHeader
        title="Environmental Monitoring"
        description="Satellite and sensor-driven monitoring of soil health, forest cover and flood hazard across the Malinao Valley District."
        stories="US-004 · 005 · 006"
      />

      <div className="px-6 pb-8 space-y-6">
        {/* ============================ A · SOIL HEALTH ===================== */}
        <Card
          title="Soil health dashboard"
          subtitle="US-004 · agronomic readings and AI degradation-risk forecast"
          right={
            <div className="flex items-center gap-2">
              <StatusPill status={reading.status} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReportNote(`Soil report for ${reading.parcelRef} queued for download (mock PDF).`)}
              >
                Download soil report (PDF)
              </Button>
            </div>
          }
        >
          {/* Parcel selector */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-medium text-gray-500 mr-1">Parcel</span>
            {soilReadings.map((r) => {
              const active = r.parcelRef === reading.parcelRef
              return (
                <button
                  key={r.parcelRef}
                  onClick={() => {
                    setSoilRef(r.parcelRef)
                    setReportNote(null)
                  }}
                  className={cx(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors',
                    active
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        r.status === 'alert' ? '#dc2626' : r.status === 'watch' ? '#f97316' : '#16a34a',
                    }}
                  />
                  {r.parcelRef}
                </button>
              )
            })}
          </div>

          {/* Four metric cards with threshold flagging */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-1.5">
                <StatCard label={m.label} value={m.value} unit={m.unit} />
                {m.flagged ? (
                  <span className="inline-flex items-center gap-1 self-start rounded-full bg-red-50 text-red-700 text-[11px] font-semibold px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {m.note}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 self-start rounded-full bg-green-50 text-green-700 text-[11px] font-medium px-2 py-0.5">
                    Within safe range
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* 12-month forecast */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800">12-month soil degradation-risk forecast</h3>
                <AIBadge title="Simulated AI projection" label="AI 12-mo forecast" />
              </div>
              <span className="text-xs text-gray-500">{reading.parcelRef} · risk index 0–100</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reading.forecast} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <RTooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v) => [`${v}`, 'Risk index']}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#dc2626"
                    strokeDasharray="4 4"
                    label={{ value: 'risk threshold', position: 'insideTopRight', fontSize: 11, fill: '#dc2626' }}
                  />
                  <Line type="monotone" dataKey="riskIndex" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {reportNote && (
              <p className="mt-2 text-xs text-brand bg-brand-light rounded-lg px-3 py-1.5 inline-block">{reportNote}</p>
            )}
          </div>
        </Card>

        {/* ===================== B · DEFORESTATION ALERTS =================== */}
        <Card
          title="Deforestation risk alerts"
          subtitle="US-005 · AI satellite change-detection with auto-correlated ownership"
          right={<AIBadge title="Simulated AI satellite detection" label="AI detection" />}
          bodyClassName="p-0"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2">
            {/* Left: alert feed */}
            <div className="divide-y divide-gray-100 border-b xl:border-b-0 xl:border-r border-gray-100 max-h-[560px] overflow-y-auto scroll-thin">
              {alerts.map((a) => {
                const selected = a.id === selectedAlertId
                const isEscalated = a.status === 'escalated'
                return (
                  <div
                    key={a.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedAlertId(a.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedAlertId(a.id)
                      }
                    }}
                    className={cx(
                      'w-full text-left p-4 transition-colors cursor-pointer',
                      selected ? 'bg-brand-light/60' : 'hover:bg-gray-50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <SeverityTag severity={a.severity} />
                        <span className="text-sm font-semibold text-gray-800">{formatHa(a.areaHa)} cleared</span>
                      </div>
                      <StatusPill status={a.status} />
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-y-1 gap-x-4 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400">Parcel </span>
                        <span className="font-medium text-gray-700">{a.parcelRef}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Owner </span>
                        <span className="font-medium text-gray-700">{a.owner}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">GPS </span>
                        <span className="font-mono text-gray-700">
                          {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Detected </span>
                        <span className="font-medium text-gray-700">{formatDate(a.detectedOn)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <NdviSwatch value={a.ndviBefore} caption="NDVI before" />
                        <svg viewBox="0 0 24 24" width="16" height="16" className="text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                        <NdviSwatch value={a.ndviAfter} caption="NDVI after" />
                        <div className="ml-1">
                          <ConfidenceChip value={a.confidence} />
                          <div className="text-[10px] text-gray-400 mt-1">AI confidence</div>
                        </div>
                      </div>

                      <span
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          setEscalateId(a.id)
                        }}
                      >
                        <Button variant="danger" size="sm" disabled={isEscalated}>
                          {isEscalated ? 'Escalated' : 'Escalate to enforcement'}
                        </Button>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right: mini-map */}
            <div className="p-4">
              <div className="h-[560px] rounded-xl overflow-hidden border border-gray-200">
                <MapContainer center={REGION_CENTER} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {alerts.map((a) => {
                    const selected = a.id === selectedAlertId
                    const color = severityColor[a.severity]
                    return (
                      <CircleMarker
                        key={a.id}
                        center={[a.lat, a.lng]}
                        radius={6 + a.areaHa * 1.2}
                        pathOptions={{
                          color,
                          weight: selected ? 3 : 1.5,
                          fillColor: color,
                          fillOpacity: selected ? 0.55 : 0.25,
                        }}
                        eventHandlers={{ click: () => setSelectedAlertId(a.id) }}
                      >
                        <Popup>
                          <div className="text-xs space-y-1">
                            <div className="font-semibold text-gray-800 capitalize">
                              {a.severity} · {formatHa(a.areaHa)} cleared
                            </div>
                            <div>Parcel {a.parcelRef} · {a.owner}</div>
                            <div className="font-mono">
                              {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                            </div>
                            <div>Detected {formatDate(a.detectedOn)}</div>
                            <div>AI confidence {Math.round(a.confidence * 100)}%</div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    )
                  })}
                </MapContainer>
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                Marker size scales with cleared area; colour reflects severity. Select an alert to highlight it.
              </p>
            </div>
          </div>
        </Card>

        {/* ======================== C · FLOOD RISK ========================= */}
        <Card
          title="Flood-risk zoning"
          subtitle="US-006 · hazard-model distribution across the cadastre"
          right={
            <span className="text-xs font-medium text-red-700 bg-red-50 rounded-full px-2.5 py-1">
              {restrictedCount} parcels permit-restricted
            </span>
          }
        >
          <div className="space-y-3">
            {floodCounts.map((f) => {
              const pct = Math.round((f.count / parcelTotal) * 100)
              return (
                <div key={f.risk} className="flex items-center gap-3">
                  <div className="w-20 flex items-center gap-2 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: floodColor[f.risk] }} />
                    <span className="text-xs font-medium text-gray-700">{floodLabel[f.risk]}</span>
                  </div>
                  <div className="flex-1">
                    <ScoreBar value={pct} color={floodColor[f.risk]} />
                  </div>
                  <div className="w-24 text-right text-xs text-gray-500 shrink-0">
                    <span className="font-semibold text-gray-800">{f.count}</span> parcels · {pct}%
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
            Flood-risk zones overlay the Parcel Map. Parcels in{' '}
            <span className="font-semibold" style={{ color: floodColor.high }}>high</span> and{' '}
            <span className="font-semibold" style={{ color: floodColor.extreme }}>extreme</span> zones automatically
            block or condition new development permits pending mitigation review.
          </p>
        </Card>
      </div>

      {/* Escalation modal */}
      <Modal
        open={!!escalating}
        onClose={() => setEscalateId(null)}
        title="Escalate to enforcement"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEscalateId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmEscalation}>
              Confirm escalation
            </Button>
          </>
        }
      >
        {escalating && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SeverityTag severity={escalating.severity} />
              <span className="font-semibold text-gray-800">{formatHa(escalating.areaHa)} cleared</span>
              <ConfidenceChip value={escalating.confidence} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Auto-correlated ownership record
                </h4>
                <AIBadge title="Simulated AI record matching" label="AI matched" />
              </div>
              <dl className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-sm">
                <dt className="text-gray-500">Parcel</dt>
                <dd className="text-gray-800 font-medium text-right">{escalating.parcelRef}</dd>
                <dt className="text-gray-500">Registered owner</dt>
                <dd className="text-gray-800 font-medium text-right">{escalating.owner}</dd>
                <dt className="text-gray-500">GPS centroid</dt>
                <dd className="text-gray-800 font-mono text-right">
                  {escalating.lat.toFixed(4)}, {escalating.lng.toFixed(4)}
                </dd>
                <dt className="text-gray-500">Detected on</dt>
                <dd className="text-gray-800 font-medium text-right">{formatDate(escalating.detectedOn)}</dd>
                {escalatingParcel ? (
                  <>
                    <dt className="text-gray-500">Recorded land use</dt>
                    <dd className="text-gray-800 font-medium text-right">{landUseLabel[escalatingParcel.landUse]}</dd>
                    <dt className="text-gray-500">Zoning</dt>
                    <dd className="text-gray-800 font-medium text-right">{escalatingParcel.zoning}</dd>
                    <dt className="text-gray-500">Title area</dt>
                    <dd className="text-gray-800 font-medium text-right">{formatHa(escalatingParcel.areaHa)}</dd>
                    {escalatingParcel.indigenousOverlap && (
                      <>
                        <dt className="text-gray-500">Ancestral domain</dt>
                        <dd className="text-amber-700 font-medium text-right">Overlap flagged</dd>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <dt className="text-gray-500">Cadastre match</dt>
                    <dd className="text-gray-800 font-medium text-right">No registered title on file</dd>
                  </>
                )}
              </dl>
            </div>

            <p className="text-xs text-gray-500">
              Confirming forwards this alert and the correlated record to the District Enforcement queue and sets its
              status to <span className="font-semibold text-red-700">escalated</span>.
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}
