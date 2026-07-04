// ---------------------------------------------------------------------------
// Shared domain types for the AI-LDMS prototype.
// All data is mock/demonstration data. "AI" fields are simulated outputs.
// ---------------------------------------------------------------------------

export type LandUse =
  | 'agricultural'
  | 'forest'
  | 'urban'
  | 'wetland'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'vacant'

export type FloodRisk = 'low' | 'medium' | 'high' | 'extreme'

export type Severity = 'minor' | 'moderate' | 'critical'

/** A single land parcel. `ring` is a polygon in [lat, lng] pairs for Leaflet. */
export interface Parcel {
  id: string
  ref: string // human-facing parcel reference, e.g. "PCL-4821"
  owner: string
  areaHa: number
  landUse: LandUse
  zoning: string
  /** Simulated AI land-use classification. */
  aiClass: LandUse
  aiConfidence: number // 0..1
  permitStatus: 'none' | 'active' | 'expiring' | 'expired'
  floodRisk: FloodRisk
  indigenousOverlap: boolean
  /** Polygon outline as [lat, lng] coordinate pairs. */
  ring: [number, number][]
}

export interface BoundaryDispute {
  id: string
  parcelRef: string
  conflictingRef: string
  severity: Severity
  detectedOn: string // ISO date
  overlapHa: number
  description: string
}

// --- Environmental monitoring --------------------------------------------

export interface SoilReading {
  parcelRef: string
  ph: number
  nitrogen: number // ppm
  phosphorus: number // ppm
  organicMatter: number // %
  /** 12-month degradation-risk forecast, one point per month (0..100). */
  forecast: { month: string; riskIndex: number }[]
  status: 'healthy' | 'watch' | 'alert'
}

export interface DeforestationAlert {
  id: string
  detectedOn: string // ISO date
  areaHa: number
  lat: number
  lng: number
  parcelRef: string
  owner: string
  severity: Severity
  confidence: number // 0..1
  status: 'new' | 'investigating' | 'escalated' | 'dismissed'
  /** Vegetation index before/after, for the before/after comparison. */
  ndviBefore: number
  ndviAfter: number
}

// --- Permits & applications ----------------------------------------------

export type PermitStage =
  | 'submitted'
  | 'pre-screening'
  | 'compliance-review'
  | 'inspection'
  | 'decision'
  | 'approved'
  | 'rejected'

export interface PermitApplication {
  id: string
  ref: string
  applicant: string
  parcelRef: string
  type: string // e.g. "Residential subdivision"
  submittedOn: string
  stage: PermitStage
  officer: string
  estCompletion: string
  /** AI pre-screening checklist. */
  checklist: { label: string; ok: boolean; note?: string }[]
  /** AI zoning-compliance findings. */
  compliance: {
    item: string
    status: 'pass' | 'flag'
    regulation?: string
    detail?: string
  }[]
  aiPreScreenScore: number // 0..1 completeness/compliance estimate
}

export interface ChatMessage {
  from: 'citizen' | 'ai'
  text: string
}

// --- Valuation & taxation -------------------------------------------------

export interface Valuation {
  parcelRef: string
  owner: string
  landUse: LandUse
  areaHa: number
  valueUsd: number
  confidenceLow: number
  confidenceHigh: number
  factors: { label: string; impact: number }[] // impact -1..1
  lastAssessed: string
}

export interface IrregularTxn {
  id: string
  parcelRef: string
  buyer: string
  seller: string
  declaredUsd: number
  aiEstimateUsd: number
  deviationPct: number // negative = under-valued
  date: string
  status: 'new' | 'investigating' | 'escalated' | 'dismissed'
}

// --- Community & indigenous ----------------------------------------------

export interface CommunityImpact {
  id: string
  project: string
  parcelRef: string
  social: number // 0..100
  environmental: number
  economic: number
  proximity: { feature: string; distanceKm: number }[]
  summary: string
  feedbackCount: number
}

export interface IndigenousZone {
  id: string
  name: string
  claimRef: string
  ring: [number, number][]
  status: 'recognized' | 'under-claim'
}

export interface ConsultationCase {
  id: string
  applicationRef: string
  zoneName: string
  triggeredOn: string
  stage: 'notified' | 'consultation-scheduled' | 'in-progress' | 'resolved'
  liaison: string
  notes: string
}

// --- Reporting & analytics -----------------------------------------------

export interface Kpi {
  label: string
  value: string
  delta: number // percentage change vs previous period
  unit?: string
}

export interface TrendPoint {
  period: string
  permits: number
  approvals: number
  complianceRate: number
  revenue: number
}

export interface ComplianceSection {
  title: string
  metric: string
  benchmark: string
  status: 'on-track' | 'below'
  recommendation?: string
}
