import type { CommunityImpact, IndigenousZone, ConsultationCase } from '../types'
import { REGION_CENTER } from './parcels'

export const communityImpacts: CommunityImpact[] = [
  {
    id: 'ci1',
    project: 'Riverside subdivision (24 lots)',
    parcelRef: 'PCL-4815',
    social: 62,
    environmental: 41,
    economic: 78,
    proximity: [
      { feature: 'Malinao Elementary School', distanceKm: 0.4 },
      { feature: 'District Health Center', distanceKm: 1.1 },
      { feature: 'Malinao River (water source)', distanceKm: 0.2 },
      { feature: 'San Isidro Chapel (cultural site)', distanceKm: 0.7 },
    ],
    summary:
      'The development scores well economically (jobs, local supply demand) but environmental impact is moderate due to proximity to the Malinao River and medium flood exposure. Recommend buffer-zone planting and a drainage study before approval.',
    feedbackCount: 37,
  },
  {
    id: 'ci2',
    project: 'Commercial complex',
    parcelRef: 'PCL-4830',
    social: 55,
    environmental: 48,
    economic: 84,
    proximity: [
      { feature: 'Public market', distanceKm: 0.3 },
      { feature: 'Jeepney terminal', distanceKm: 0.2 },
      { feature: 'Day-care center', distanceKm: 0.6 },
    ],
    summary:
      'Strong economic upside and good transport access. Main community concern from portal feedback is increased traffic near the day-care center. Recommend a traffic-management plan.',
    feedbackCount: 21,
  },
]

// Indigenous ancestral domain in the NE of the district (overlaps NE parcels).
const c = REGION_CENTER
export const indigenousZones: IndigenousZone[] = [
  {
    id: 'iz1',
    name: 'Dumagat Ancestral Domain',
    claimRef: 'CADT-R4A-018',
    status: 'recognized',
    ring: [
      [c[0] + 0.009, c[1] + 0.008],
      [c[0] + 0.026, c[1] + 0.006],
      [c[0] + 0.03, c[1] + 0.03],
      [c[0] + 0.011, c[1] + 0.028],
    ],
  },
]

export const consultationCases: ConsultationCase[] = [
  {
    id: 'cc1',
    applicationRef: 'APP-2026-0431',
    zoneName: 'Dumagat Ancestral Domain',
    triggeredOn: '2026-06-24',
    stage: 'notified',
    liaison: 'NCIP Liaison — R. Mercado',
    notes:
      'Commercial building application intersects the recognized ancestral domain by 0.6 ha. Free, Prior and Informed Consent (FPIC) process is mandatory before the application can proceed.',
  },
  {
    id: 'cc2',
    applicationRef: 'APP-2026-0402',
    zoneName: 'Dumagat Ancestral Domain',
    triggeredOn: '2026-06-13',
    stage: 'consultation-scheduled',
    liaison: 'NCIP Liaison — R. Mercado',
    notes: 'Community assembly scheduled 2026-07-05 to discuss the proposed land conversion.',
  },
]

export const consultationStages = [
  'notified',
  'consultation-scheduled',
  'in-progress',
  'resolved',
] as const
