import { useMemo, useState } from 'react'
import {
  PageHeader,
  Card,
  StatCard,
  AIBadge,
  ConfidenceChip,
  StatusPill,
  Button,
  Modal,
} from '../components/ui'
import { landUseColor, landUseLabel } from '../lib/colors'
import { cx, formatUsd, formatPhp, formatHa, formatDate, signedPct } from '../lib/format'
import { valuations, irregularTxns, DEVIATION_FLAG_PCT } from '../data/valuation'
import type { IrregularTxn } from '../types'

// --- Small visualisations --------------------------------------------------

/** Confidence interval as a track with a band (low..high) and a value marker. */
function IntervalBar({ low, high, value }: { low: number; high: number; value: number }) {
  const span = high - low
  const pad = span * 0.5 || value * 0.1
  const min = low - pad
  const max = high + pad
  const range = max - min || 1
  const pct = (n: number) => ((n - min) / range) * 100
  return (
    <div
      className="relative h-2 w-full rounded-full bg-gray-100"
      title={`${formatUsd(low)} – ${formatUsd(high)}`}
    >
      <div
        className="absolute top-0 h-full rounded-full bg-brand-light"
        style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}
      />
      <div
        className="absolute top-1/2 h-3.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-brand"
        style={{ left: `${pct(value)}%` }}
      />
    </div>
  )
}

/** Impact bar centred at zero: green right (positive), red left (negative). */
function ImpactBar({ impact }: { impact: number }) {
  const positive = impact >= 0
  const widthPct = Math.min(Math.abs(impact), 1) * 50
  return (
    <div className="relative h-2 w-full rounded bg-gray-100">
      <div className="absolute inset-y-0 left-1/2 w-px bg-gray-300" />
      <div
        className={cx('absolute top-0 h-full', positive ? 'rounded-r bg-green-500' : 'rounded-l bg-red-500')}
        style={positive ? { left: '50%', width: `${widthPct}%` } : { right: '50%', width: `${widthPct}%` }}
      />
    </div>
  )
}

// --- Page ------------------------------------------------------------------

export default function Valuation() {
  const [selectedRef, setSelectedRef] = useState(valuations[0].parcelRef)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [justification, setJustification] = useState('')
  const [proposedValue, setProposedValue] = useState('')

  const selected = valuations.find((v) => v.parcelRef === selectedRef) ?? valuations[0]
  const halfWidth = (selected.confidenceHigh - selected.confidenceLow) / 2
  const derivedConf = Math.max(0, Math.min(1, 1 - halfWidth / selected.valueUsd))

  // Irregular transactions — local state so mock actions can mutate status.
  const [txns, setTxns] = useState<IrregularTxn[]>(irregularTxns)
  const setStatus = (id: string, status: IrregularTxn['status']) =>
    setTxns((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))

  const isFlagged = (t: IrregularTxn) => Math.abs(t.deviationPct) >= DEVIATION_FLAG_PCT

  const sortedTxns = useMemo(
    () =>
      [...txns].sort((a, b) => {
        const fa = isFlagged(a) ? 1 : 0
        const fb = isFlagged(b) ? 1 : 0
        if (fa !== fb) return fb - fa
        return Math.abs(b.deviationPct) - Math.abs(a.deviationPct)
      }),
    [txns],
  )

  const totalValue = valuations.reduce((s, v) => s + v.valueUsd, 0)
  const flagged = txns.filter(isFlagged)
  const avgFlaggedDev =
    flagged.length > 0 ? flagged.reduce((s, t) => s + t.deviationPct, 0) / flagged.length : 0

  const closeAdjust = () => {
    setAdjustOpen(false)
    setJustification('')
    setProposedValue('')
  }

  return (
    <div className="px-2 pb-8">
      <PageHeader
        title="Land Valuation & Taxation"
        description="AI-assisted parcel valuations with confidence intervals, plus automated detection of under-declared property transfers for tax-fairness review."
        stories="US-010 · 011"
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4">
        <StatCard label="Parcels assessed" value={String(valuations.length)} />
        <StatCard label="Total AI-assessed value" value={formatUsd(totalValue)} />
        <StatCard label="Flagged transactions" value={String(flagged.length)} unit={`of ${txns.length}`} />
        <StatCard label="Avg. under-valuation (flagged)" value={signedPct(avgFlaggedDev)} />
      </div>

      <div className="mt-4 space-y-4 px-4">
        {/* ---------------- US-010: Valuation ---------------- */}
        <Card
          title="AI-assessed land values"
          subtitle="Estimated market value with model confidence interval. Select a parcel for valuation factors."
          right={<AIBadge title="Valuations are simulated AI model outputs" />}
        >
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
            {/* Table */}
            <div className="xl:col-span-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-3 font-medium">Parcel</th>
                    <th className="py-2 pr-3 font-medium">Owner</th>
                    <th className="py-2 pr-3 font-medium">Land use</th>
                    <th className="py-2 pr-3 text-right font-medium">Area</th>
                    <th className="py-2 pr-3 text-right font-medium">
                      <span className="inline-flex items-center gap-1">
                        AI value <AIBadge />
                      </span>
                    </th>
                    <th className="py-2 font-medium">Conf. interval</th>
                  </tr>
                </thead>
                <tbody>
                  {valuations.map((v) => {
                    const active = v.parcelRef === selectedRef
                    return (
                      <tr
                        key={v.parcelRef}
                        onClick={() => setSelectedRef(v.parcelRef)}
                        className={cx(
                          'cursor-pointer border-b border-gray-50 align-middle transition-colors',
                          active ? 'bg-brand-light/60 ring-1 ring-inset ring-brand/30' : 'hover:bg-gray-50',
                        )}
                      >
                        <td className="py-2.5 pr-3 font-semibold text-gray-800">{v.parcelRef}</td>
                        <td className="py-2.5 pr-3 text-gray-600">{v.owner}</td>
                        <td className="py-2.5 pr-3">
                          <span className="inline-flex items-center gap-1.5 text-gray-700">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-sm"
                              style={{ backgroundColor: landUseColor[v.landUse] }}
                            />
                            {landUseLabel[v.landUse]}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-gray-600">{formatHa(v.areaHa)}</td>
                        <td className="py-2.5 pr-3 text-right">
                          <div className="font-semibold tabular-nums text-gray-900">{formatUsd(v.valueUsd)}</div>
                          <div className="text-[11px] tabular-nums text-gray-400">{formatPhp(v.valueUsd)}</div>
                        </td>
                        <td className="py-2.5">
                          <div className="w-32">
                            <IntervalBar low={v.confidenceLow} high={v.confidenceHigh} value={v.valueUsd} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Detail panel */}
            <div className="xl:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800">{selected.parcelRef}</h3>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-gray-500"
                        title={landUseLabel[selected.landUse]}
                      >
                        <span
                          className="h-2 w-2 rounded-sm"
                          style={{ backgroundColor: landUseColor[selected.landUse] }}
                        />
                        {landUseLabel[selected.landUse]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{selected.owner}</div>
                  </div>
                  <AIBadge title="Simulated AI valuation" />
                </div>

                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <div className="text-2xl font-bold tabular-nums text-gray-900">{formatUsd(selected.valueUsd)}</div>
                    <div className="text-xs tabular-nums text-gray-400">{formatPhp(selected.valueUsd)}</div>
                  </div>
                  <ConfidenceChip value={derivedConf} />
                </div>

                <div className="mt-3">
                  <IntervalBar
                    low={selected.confidenceLow}
                    high={selected.confidenceHigh}
                    value={selected.valueUsd}
                  />
                  <div className="mt-1 flex justify-between text-[11px] tabular-nums text-gray-500">
                    <span>{formatUsd(selected.confidenceLow)}</span>
                    <span className="text-gray-400">90% confidence interval</span>
                    <span>{formatUsd(selected.confidenceHigh)}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Last assessed</span>
                  <span className="font-medium text-gray-700">{formatDate(selected.lastAssessed)}</span>
                </div>

                {/* Factors */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    Valuation factors <AIBadge />
                  </div>
                  <div className="space-y-2.5">
                    {selected.factors.map((f) => (
                      <div key={f.label} className="grid grid-cols-[1fr_88px_44px] items-center gap-2">
                        <span className="truncate text-xs text-gray-600" title={f.label}>
                          {f.label}
                        </span>
                        <ImpactBar impact={f.impact} />
                        <span
                          className={cx(
                            'text-right text-[11px] font-semibold tabular-nums',
                            f.impact >= 0 ? 'text-green-600' : 'text-red-600',
                          )}
                        >
                          {signedPct(f.impact * 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400">
                    Bars centred at zero — right (green) raises value, left (red) lowers it.
                  </div>
                </div>

                <div className="mt-4">
                  <Button size="sm" variant="secondary" onClick={() => setAdjustOpen(true)}>
                    Adjust valuation (with justification)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ---------------- US-011: Irregular transactions ---------------- */}
        <Card
          title="Irregular transaction detection"
          subtitle="Property transfers screened against AI-estimated market value to surface possible tax under-declaration."
          right={<AIBadge title="Anomaly detection is a simulated AI model" />}
        >
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <span className="mt-0.5 text-amber-500">&#9888;</span>
            <span>
              The model flags any transfer with a declared price more than{' '}
              <span className="font-semibold">{DEVIATION_FLAG_PCT}%</span> below the AI-estimated market value for
              fraud / under-declaration review.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-3 font-medium">Parcel</th>
                  <th className="py-2 pr-3 font-medium">Seller &rarr; Buyer</th>
                  <th className="py-2 pr-3 text-right font-medium">Declared</th>
                  <th className="py-2 pr-3 text-right font-medium">
                    <span className="inline-flex items-center gap-1">
                      AI estimate <AIBadge />
                    </span>
                  </th>
                  <th className="py-2 pr-3 text-right font-medium">Deviation</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTxns.map((t) => {
                  const flag = isFlagged(t)
                  return (
                    <tr
                      key={t.id}
                      className={cx('border-b border-gray-50 align-middle', flag ? 'bg-red-50/40' : '')}
                    >
                      <td className="py-3 pr-3 font-semibold text-gray-800">{t.parcelRef}</td>
                      <td className="py-3 pr-3 text-gray-600">
                        <span className="text-gray-700">{t.seller}</span>
                        <span className="mx-1 text-gray-400">&rarr;</span>
                        <span className="text-gray-700">{t.buyer}</span>
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums text-gray-700">{formatUsd(t.declaredUsd)}</td>
                      <td className="py-3 pr-3 text-right tabular-nums text-gray-700">{formatUsd(t.aiEstimateUsd)}</td>
                      <td className="py-3 pr-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {flag && (
                            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                              flagged
                            </span>
                          )}
                          <span
                            className={cx(
                              'tabular-nums',
                              flag ? 'text-base font-bold text-red-600' : 'text-sm font-medium text-gray-500',
                            )}
                          >
                            {signedPct(t.deviationPct)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 whitespace-nowrap text-gray-500">{formatDate(t.date)}</td>
                      <td className="py-3 pr-3">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={t.status === 'investigating'}
                            onClick={() => setStatus(t.id, 'investigating')}
                          >
                            Investigate
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={t.status === 'escalated'}
                            onClick={() => setStatus(t.id, 'escalated')}
                          >
                            Escalate
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={t.status === 'dismissed'}
                            onClick={() => setStatus(t.id, 'dismissed')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Adjust valuation modal (mock) */}
      <Modal
        open={adjustOpen}
        onClose={closeAdjust}
        title={`Adjust valuation — ${selected.parcelRef}`}
        footer={
          <>
            <Button variant="ghost" onClick={closeAdjust}>
              Cancel
            </Button>
            <Button variant="primary" disabled={justification.trim().length === 0} onClick={closeAdjust}>
              Submit for review
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
            <span className="text-gray-500">Current AI valuation</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800">
              {formatUsd(selected.valueUsd)} <AIBadge />
            </span>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">Proposed assessed value (USD)</span>
            <input
              type="number"
              value={proposedValue}
              onChange={(e) => setProposedValue(e.target.value)}
              placeholder={String(selected.valueUsd)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-600">
              Justification <span className="text-red-500">*</span>
            </span>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              placeholder="Document the evidence for overriding the AI valuation (comparable sales, site inspection, appeal reference)…"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <span className="mt-1 block text-[11px] text-gray-400">
              A written justification is required and logged to the audit trail for every manual override.
            </span>
          </label>
        </div>
      </Modal>
    </div>
  )
}
