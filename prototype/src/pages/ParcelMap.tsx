import { useState } from 'react'
import type { ReactNode } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import type { Parcel, LandUse, FloodRisk } from '../types'
import {
  PageHeader,
  Card,
  AIBadge,
  ConfidenceChip,
  StatusPill,
  SeverityTag,
  Button,
} from '../components/ui'
import { landUseColor, landUseLabel, floodColor } from '../lib/colors'
import { cx, formatHa, formatDate } from '../lib/format'
import { parcels, boundaryDisputes, REGION_CENTER, reclassifyCandidates } from '../data/parcels'
import { indigenousZones } from '../data/community'

type Layer = 'landuse' | 'flood' | 'classification'

const LAND_USES: LandUse[] = [
  'agricultural',
  'forest',
  'urban',
  'wetland',
  'residential',
  'commercial',
  'industrial',
  'vacant',
]
const FLOOD_RISKS: FloodRisk[] = ['low', 'medium', 'high', 'extreme']

const LAYER_OPTIONS: { id: Layer; label: string }[] = [
  { id: 'landuse', label: 'Land use' },
  { id: 'flood', label: 'Flood risk' },
  { id: 'classification', label: 'AI classification' },
]

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-sm border border-black/10 shrink-0"
      style={{ backgroundColor: color }}
    />
  )
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right flex items-center gap-1.5">
        {children}
      </span>
    </div>
  )
}

export default function ParcelMap() {
  const [layer, setLayer] = useState<Layer>('landuse')
  const [selected, setSelected] = useState<Parcel | null>(null)
  const [indigenousOn, setIndigenousOn] = useState(true)
  const [startedDisputes, setStartedDisputes] = useState<string[]>([])

  const permitWatch = parcels.filter(
    (p) => p.permitStatus === 'expiring' || p.permitStatus === 'expired',
  ).length

  function fillFor(p: Parcel): string {
    if (layer === 'flood') return floodColor[p.floodRisk]
    if (layer === 'classification') return landUseColor[p.aiClass]
    return landUseColor[p.landUse]
  }

  function tipLabel(p: Parcel): string {
    if (layer === 'flood') return `${p.floodRisk} flood risk`
    if (layer === 'classification') return landUseLabel[p.aiClass]
    return landUseLabel[p.landUse]
  }

  const legend =
    layer === 'flood'
      ? FLOOD_RISKS.map((r) => ({ color: floodColor[r], label: r }))
      : LAND_USES.map((u) => ({ color: landUseColor[u], label: landUseLabel[u] }))

  return (
    <div>
      <PageHeader
        title="Parcel Map"
        description="Interactive AI-generated cadastre with land-use classification and boundary-dispute detection."
        stories="US-001 · 002 · 003"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6 pb-6">
        {/* Map — visual centrepiece */}
        <div className="lg:col-span-2">
          <div className="relative h-[560px] rounded-xl overflow-hidden border border-gray-200">
            <MapContainer center={REGION_CENTER} zoom={14} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />

              {parcels.map((p) => {
                const mismatch = layer === 'classification' && p.aiClass !== p.landUse
                const isSel = selected?.id === p.id
                const color = fillFor(p)
                return (
                  <Polygon
                    key={p.id}
                    positions={p.ring}
                    eventHandlers={{ click: () => setSelected(p) }}
                    pathOptions={{
                      color: isSel ? '#111827' : color,
                      weight: isSel ? 3 : 1,
                      fillColor: color,
                      fillOpacity: 0.55,
                      dashArray: mismatch ? '4' : undefined,
                    }}
                  >
                    <Tooltip>
                      {p.ref} — {tipLabel(p)}
                    </Tooltip>
                  </Polygon>
                )
              })}

              {indigenousOn &&
                indigenousZones.map((z) => (
                  <Polygon
                    key={z.id}
                    positions={z.ring}
                    pathOptions={{
                      color: '#7c3aed',
                      weight: 2,
                      fillColor: '#7c3aed',
                      fillOpacity: 0.2,
                      dashArray: '5',
                    }}
                  >
                    <Tooltip>
                      {z.name} · {z.claimRef}
                    </Tooltip>
                  </Polygon>
                ))}
            </MapContainer>

            {/* Floating control + legend */}
            <div className="absolute top-3 left-3 z-[1000] bg-white/95 rounded-lg shadow p-2 text-xs w-44">
              <div className="font-semibold text-gray-700 mb-1.5 px-0.5">Map layer</div>
              <div className="space-y-1">
                {LAYER_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 px-0.5 cursor-pointer text-gray-700"
                  >
                    <input
                      type="radio"
                      name="layer"
                      className="accent-brand"
                      checked={layer === opt.id}
                      onChange={() => setLayer(opt.id)}
                    />
                    <span className="flex items-center gap-1">
                      {opt.label}
                      {opt.id === 'classification' && <AIBadge />}
                    </span>
                  </label>
                ))}
              </div>

              <label className="flex items-center gap-2 px-0.5 mt-2 pt-2 border-t border-gray-200 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  className="accent-violet-600"
                  checked={indigenousOn}
                  onChange={(e) => setIndigenousOn(e.target.checked)}
                />
                <span className="flex items-center gap-1.5">
                  <Swatch color="#7c3aed" /> Indigenous overlay
                </span>
              </label>

              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="font-semibold text-gray-700 mb-1 px-0.5">
                  {layer === 'flood' ? 'Flood risk' : 'Land use'}
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {legend.map((l) => (
                    <span key={l.label} className="flex items-center gap-1.5 capitalize text-gray-600">
                      <Swatch color={l.color} /> {l.label}
                    </span>
                  ))}
                </div>
                {layer === 'classification' && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-gray-500">
                    <span className="inline-block w-4 border-t-2 border-dashed border-gray-500" />
                    AI ≠ recorded use
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* 1. Selected parcel detail */}
          <Card title="Parcel detail" subtitle="Click a parcel on the map">
            {!selected ? (
              <div className="text-sm text-gray-400 py-6 text-center">
                No parcel selected. Click any polygon to inspect ownership, zoning and the AI
                land-use classification.
              </div>
            ) : (
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-lg font-bold text-gray-800">{selected.ref}</span>
                  <StatusPill status={selected.permitStatus} />
                </div>

                <div className="mt-2">
                  <DetailRow label="Owner">{selected.owner}</DetailRow>
                  <DetailRow label="Area">{formatHa(selected.areaHa)}</DetailRow>
                  <DetailRow label="Zoning">{selected.zoning}</DetailRow>
                  <DetailRow label="Land use">
                    <Swatch color={landUseColor[selected.landUse]} />
                    {landUseLabel[selected.landUse]}
                  </DetailRow>
                  <DetailRow label="Flood risk">
                    <Swatch color={floodColor[selected.floodRisk]} />
                    <span className="capitalize">{selected.floodRisk}</span>
                  </DetailRow>
                </div>

                {/* AI classification (US-002) */}
                <div className="mt-3 rounded-lg border border-violet-100 bg-violet-50/50 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                      <AIBadge /> Classification
                    </span>
                    <ConfidenceChip value={selected.aiConfidence} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-800 font-medium">
                    <Swatch color={landUseColor[selected.aiClass]} />
                    {landUseLabel[selected.aiClass]}
                  </div>
                  {selected.aiClass !== selected.landUse && (
                    <div className="mt-2 text-xs text-amber-800 bg-amber-100 rounded px-2 py-1.5">
                      AI suggests reclassification from{' '}
                      <strong>{landUseLabel[selected.landUse]}</strong> to{' '}
                      <strong>{landUseLabel[selected.aiClass]}</strong> — review.
                    </div>
                  )}
                </div>

                {selected.indigenousOverlap && (
                  <div className="mt-2 text-xs text-violet-800 bg-violet-100 rounded px-2 py-1.5 flex items-start gap-1.5">
                    <span className="mt-0.5">⚠</span>
                    Overlaps a recognized indigenous ancestral domain — FPIC consultation required.
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* 2. AI Alerts — Boundary disputes (US-003) */}
          <Card
            title="AI Alerts — Boundary disputes"
            subtitle="Auto-detected title & survey conflicts"
            right={<AIBadge />}
          >
            <ul className="space-y-3">
              {boundaryDisputes.map((d) => {
                const started = startedDisputes.includes(d.id)
                return (
                  <li key={d.id} className="rounded-lg border border-gray-200 p-2.5 bg-gray-50/60">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {d.parcelRef} <span className="text-gray-400 font-normal">vs</span>{' '}
                        {d.conflictingRef}
                      </span>
                      <SeverityTag severity={d.severity} />
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        Overlap <strong className="text-gray-700">{formatHa(d.overlapHa)}</strong>
                      </span>
                      <span>{formatDate(d.detectedOn)}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">{d.description}</p>
                    <div className="mt-2">
                      {started ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 rounded px-2 py-1">
                          ✓ Resolution workflow started
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setStartedDisputes((s) => [...s, d.id])}
                        >
                          Start dispute resolution
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* 3. Stats */}
          <Card title="Cadastre summary">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-2xl font-bold text-gray-800">{parcels.length}</div>
                <div className="text-xs text-gray-500">Total parcels</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold text-gray-800">
                    {reclassifyCandidates.length}
                  </span>
                  <AIBadge />
                </div>
                <div className="text-xs text-gray-500">AI-flagged reclassification</div>
              </div>
              <div>
                <div
                  className={cx(
                    'text-2xl font-bold',
                    permitWatch > 0 ? 'text-amber-600' : 'text-gray-800',
                  )}
                >
                  {permitWatch}
                </div>
                <div className="text-xs text-gray-500">Permits expiring / expired</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
