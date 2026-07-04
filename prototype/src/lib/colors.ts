import type { LandUse, FloodRisk, Severity } from '../types'

export const landUseColor: Record<LandUse, string> = {
  agricultural: '#c9a227',
  forest: '#1a5c2a',
  urban: '#9ca3af',
  wetland: '#0e7490',
  residential: '#e07a3f',
  commercial: '#7c3aed',
  industrial: '#475569',
  vacant: '#d6d3c1',
}

export const landUseLabel: Record<LandUse, string> = {
  agricultural: 'Agricultural',
  forest: 'Forest',
  urban: 'Urban',
  wetland: 'Wetland',
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  vacant: 'Vacant',
}

export const floodColor: Record<FloodRisk, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  extreme: '#dc2626',
}

export const severityColor: Record<Severity, string> = {
  minor: '#eab308',
  moderate: '#f97316',
  critical: '#dc2626',
}

/** Tailwind-class pill styles for generic statuses. */
export const statusPill: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  investigating: 'bg-amber-100 text-amber-800',
  escalated: 'bg-red-100 text-red-800',
  dismissed: 'bg-gray-100 text-gray-600',
  resolved: 'bg-green-100 text-green-800',
  healthy: 'bg-green-100 text-green-800',
  watch: 'bg-amber-100 text-amber-800',
  alert: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  expiring: 'bg-amber-100 text-amber-800',
  expired: 'bg-red-100 text-red-800',
  none: 'bg-gray-100 text-gray-600',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pass: 'bg-green-100 text-green-800',
  flag: 'bg-red-100 text-red-800',
  'on-track': 'bg-green-100 text-green-800',
  below: 'bg-red-100 text-red-800',
}

/** Confidence → colour (green high, amber mid, red low). */
export function confidenceColor(c: number): string {
  if (c >= 0.85) return '#16a34a'
  if (c >= 0.7) return '#eab308'
  return '#dc2626'
}
