import { Fragment, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts'
import { PageHeader, Card, StatCard, AIBadge, Button, StatusPill } from '../components/ui'
import {
  kpis,
  trends,
  weeklySummary,
  complianceSections,
  reportMeta,
} from '../data/analytics'

// Chart palette — kept close to the brand green with a clear accent for the rate line.
const C_PERMITS = '#2e7d32'
const C_APPROVALS = '#a5d6a7'
const C_RATE = '#f59e0b'
const C_REVENUE = '#2e7d32'

const AXIS_TICK = { fontSize: 12, fill: '#6b7280' }
const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
}

type ReportState = 'idle' | 'generating' | 'ready'

export default function Analytics() {
  const [reportState, setReportState] = useState<ReportState>('idle')
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)

  const flaggedCount = complianceSections.filter((s) => s.status === 'below').length

  function generate() {
    setReportState('generating')
    setGeneratedAt(null)
    setTimeout(() => {
      setGeneratedAt(
        new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      )
      setReportState('ready')
    }, 800)
  }

  return (
    <>
      <PageHeader
        title="Reporting &amp; Analytics"
        description="Executive KPI dashboard with an AI-written narrative and one-click regulatory compliance reporting."
        stories="US-014 · 015"
      />

      <div className="px-6 pb-10 space-y-5">
        {/* US-014 — KPI strip ------------------------------------------------ */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((k) => (
            <StatCard key={k.label} label={k.label} value={k.value} unit={k.unit} delta={k.delta} />
          ))}
        </div>

        {/* US-014 — Charts -------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card
            title="Permits &amp; approvals"
            subtitle="Monthly volume vs. AI-tracked compliance rate"
            right={<span className="text-[11px] text-gray-400">Jan – Jun 2026</span>}
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trends} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={AXIS_TICK}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[80, 100]}
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <RTooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="permits"
                    name="Permits"
                    fill={C_PERMITS}
                    barSize={14}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="approvals"
                    name="Approvals"
                    fill={C_APPROVALS}
                    barSize={14}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="complianceRate"
                    name="Compliance rate"
                    stroke={C_RATE}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: C_RATE }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card
            title="Revenue trend"
            subtitle="Fees, levies &amp; collections (USD, millions)"
            right={<span className="text-[11px] text-gray-400">Jan – Jun 2026</span>}
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C_REVENUE} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={C_REVENUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={AXIS_TICK}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v) => `$${v}M`}
                  />
                  <RTooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [`$${value}M`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={C_REVENUE}
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* US-014 — AI weekly narrative ------------------------------------- */}
        <Card
          title="AI weekly summary"
          subtitle="Natural-language briefing generated from this week's operational data"
          right={<AIBadge label="AI narrative" title="Simulated AI-generated summary" />}
        >
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-gray-700">{weeklySummary}</p>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand"
                >
                  <path d="M3 12h4l3 8 4-16 3 8h4" />
                </svg>
                <span>
                  Drill down:{' '}
                  <span className="font-medium text-gray-700">national → regional → parcel</span>
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => undefined}>
                Export dashboard (PDF / PPTX)
              </Button>
            </div>
          </div>
        </Card>

        {/* US-015 — AI compliance report ------------------------------------ */}
        <Card
          title={reportMeta.title}
          subtitle={`${reportMeta.period} · ${reportMeta.authority}`}
          right={
            reportState === 'ready' ? (
              <AIBadge label="AI draft" title="Simulated AI-generated compliance report" />
            ) : (
              <span className="text-[11px] text-gray-400">
                {complianceSections.length} metric domains
              </span>
            )
          }
        >
          {reportState === 'idle' && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="grid place-items-center w-12 h-12 rounded-full bg-brand-light text-brand">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12h6M9 16h6M9 8h2M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v5h5" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 max-w-md">
                The AI will draft a {reportMeta.period} report and flag every metric below benchmark
                with a recommended corrective action.
              </p>
              <Button onClick={generate}>Generate compliance report</Button>
            </div>
          )}

          {reportState === 'generating' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <svg className="animate-spin h-6 w-6 text-brand" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <p className="text-sm text-gray-600">Generating compliance report…</p>
              <p className="text-xs text-gray-400">
                Scoring {complianceSections.length} metric domains against NLA benchmarks
              </p>
            </div>
          )}

          {reportState === 'ready' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                <span className="inline-flex flex-wrap items-center gap-2">
                  <AIBadge label="AI" />
                  Auto-generated{generatedAt && <span className="text-gray-600">· {generatedAt}</span>}{' '}
                  · <span className="font-medium text-red-600">{flaggedCount} metrics below benchmark</span>
                </span>
                <Button variant="ghost" size="sm" onClick={generate}>
                  Regenerate
                </Button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                      <th className="py-2.5 px-3 font-semibold">Compliance area</th>
                      <th className="py-2.5 px-3 font-semibold">Current metric</th>
                      <th className="py-2.5 px-3 font-semibold">Benchmark</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceSections.map((s) => (
                      <Fragment key={s.title}>
                        <tr className="border-t border-gray-100">
                          <td className="py-2.5 px-3 font-medium text-gray-800">{s.title}</td>
                          <td className="py-2.5 px-3 text-gray-600">{s.metric}</td>
                          <td className="py-2.5 px-3 text-gray-500">{s.benchmark}</td>
                          <td className="py-2.5 px-3">
                            <StatusPill
                              status={s.status}
                              label={s.status === 'below' ? 'Below benchmark' : 'On track'}
                            />
                          </td>
                        </tr>
                        {s.status === 'below' && s.recommendation && (
                          <tr>
                            <td colSpan={4} className="px-3 pb-3">
                              <div className="flex items-start gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2">
                                <AIBadge label="AI rec" title="Simulated AI recommendation" />
                                <p className="text-xs leading-relaxed text-violet-900">
                                  {s.recommendation}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button onClick={() => undefined}>Export PDF</Button>
                <Button variant="secondary" onClick={() => undefined}>
                  Export PowerPoint
                </Button>
                <Button variant="ghost" onClick={() => undefined}>
                  Schedule automatic delivery
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
