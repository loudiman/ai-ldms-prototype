import type { Kpi, TrendPoint, ComplianceSection } from '../types'

export const kpis: Kpi[] = [
  { label: 'Total parcels', value: '52,418', delta: 1.2 },
  { label: 'Permits approved (YTD)', value: '1,284', delta: 8.4 },
  { label: 'Avg. processing time', value: '23', unit: 'days', delta: -14.6 },
  { label: 'Compliance rate', value: '91.3%', delta: 3.1 },
  { label: 'Revenue collected (YTD)', value: '$4.6M', delta: 6.7 },
  { label: 'Open disputes', value: '47', delta: -9.2 },
]

export const trends: TrendPoint[] = [
  { period: 'Jan', permits: 182, approvals: 151, complianceRate: 86, revenue: 0.62 },
  { period: 'Feb', permits: 174, approvals: 149, complianceRate: 87, revenue: 0.58 },
  { period: 'Mar', permits: 205, approvals: 178, complianceRate: 88, revenue: 0.71 },
  { period: 'Apr', permits: 221, approvals: 196, complianceRate: 90, revenue: 0.78 },
  { period: 'May', permits: 238, approvals: 214, complianceRate: 91, revenue: 0.83 },
  { period: 'Jun', permits: 264, approvals: 241, complianceRate: 92, revenue: 0.91 },
]

export const weeklySummary =
  'Permit volume rose 11% week-over-week, driven by residential subdivision applications in the central district. ' +
  'Average processing time fell to 23 days (−4 days), as AI pre-screening cleared 78% of submissions without manual rework. ' +
  'Compliance rate reached 92%, though open-space allocation remains the most common flag (31% of flagged items). ' +
  'Three new critical deforestation alerts in the northern forest belt warrant enforcement follow-up.'

export const complianceSections: ComplianceSection[] = [
  {
    title: 'Permit processing time',
    metric: '23 days average',
    benchmark: '≤ 30 days',
    status: 'on-track',
  },
  {
    title: 'Inspection completion',
    metric: '88% within SLA',
    benchmark: '≥ 95%',
    status: 'below',
    recommendation: 'Add one roving inspector to the eastern district to clear the backlog.',
  },
  {
    title: 'Unresolved violations',
    metric: '47 open',
    benchmark: '≤ 40 open',
    status: 'below',
    recommendation: 'Prioritise the 12 cases older than 90 days for escalation.',
  },
  {
    title: 'Environmental alert response',
    metric: '2.1 days to action',
    benchmark: '≤ 3 days',
    status: 'on-track',
  },
]

export const reportMeta = {
  title: 'Quarterly Regulatory Compliance Report',
  period: 'Q2 2026 (Apr–Jun)',
  authority: 'National Land Authority — reporting standard NLA-RS-04',
}
