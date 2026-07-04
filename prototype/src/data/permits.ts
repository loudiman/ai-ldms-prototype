import type { PermitApplication, ChatMessage, PermitStage } from '../types'

export const permitStages: PermitStage[] = [
  'submitted',
  'pre-screening',
  'compliance-review',
  'inspection',
  'decision',
]

export const permitApplications: PermitApplication[] = [
  {
    id: 'a1',
    ref: 'APP-2026-0418',
    applicant: 'Riverside Devt. Partners',
    parcelRef: 'PCL-4815',
    type: 'Residential subdivision (24 lots)',
    submittedOn: '2026-06-20',
    stage: 'pre-screening',
    officer: 'Eng. P. Ramos',
    estCompletion: '2026-07-28',
    aiPreScreenScore: 0.72,
    checklist: [
      { label: 'Certified true copy of title', ok: true },
      { label: 'Approved subdivision survey plan', ok: true },
      { label: 'Environmental compliance certificate', ok: false, note: 'Not attached' },
      { label: 'Drainage & site development plan', ok: true },
      { label: 'Barangay clearance', ok: false, note: 'Expired (2025)' },
    ],
    compliance: [
      { item: 'Land use vs zoning (R-1)', status: 'pass' },
      { item: 'Minimum lot size 120 m²', status: 'pass' },
      {
        item: 'Open-space allocation ≥ 30%',
        status: 'flag',
        regulation: 'BP 220 §5',
        detail: 'Plan allocates 22%; below required 30%.',
      },
      {
        item: 'Flood-zone setback',
        status: 'flag',
        regulation: 'Local Ord. 14-2021',
        detail: 'Lots 18–24 fall within medium flood-risk band.',
      },
    ],
  },
  {
    id: 'a2',
    ref: 'APP-2026-0402',
    applicant: 'M. Santos',
    parcelRef: 'PCL-4823',
    type: 'Agricultural to residential conversion',
    submittedOn: '2026-06-12',
    stage: 'compliance-review',
    officer: 'Eng. P. Ramos',
    estCompletion: '2026-07-15',
    aiPreScreenScore: 0.55,
    checklist: [
      { label: 'Certified true copy of title', ok: true },
      { label: 'DAR conversion clearance', ok: false, note: 'Required for agri land' },
      { label: 'Vicinity / location map', ok: true },
      { label: 'Tax declaration', ok: true },
    ],
    compliance: [
      {
        item: 'Land use vs zoning (A-1)',
        status: 'flag',
        regulation: 'CLUP 2023 §7.2',
        detail: 'Parcel is zoned Agricultural; conversion requires reclassification.',
      },
      { item: 'Road right-of-way access', status: 'pass' },
    ],
  },
  {
    id: 'a3',
    ref: 'APP-2026-0431',
    applicant: 'Greenfield Estates Inc.',
    parcelRef: 'PCL-4830',
    type: 'Commercial building permit',
    submittedOn: '2026-06-24',
    stage: 'submitted',
    officer: 'Unassigned',
    estCompletion: '2026-08-05',
    aiPreScreenScore: 0.9,
    checklist: [
      { label: 'Certified true copy of title', ok: true },
      { label: 'Architectural & structural plans', ok: true },
      { label: 'Fire safety evaluation clearance', ok: true },
      { label: 'Locational clearance', ok: true },
    ],
    compliance: [
      { item: 'Land use vs zoning (C-1)', status: 'pass' },
      { item: 'Parking provision', status: 'pass' },
      { item: 'Building height limit', status: 'pass' },
    ],
  },
  {
    id: 'a4',
    ref: 'APP-2026-0377',
    applicant: 'L. Dela Cruz',
    parcelRef: 'PCL-4819',
    type: 'Fencing permit',
    submittedOn: '2026-06-02',
    stage: 'inspection',
    officer: 'Eng. T. Flores',
    estCompletion: '2026-07-01',
    aiPreScreenScore: 0.95,
    checklist: [
      { label: 'Certified true copy of title', ok: true },
      { label: 'Site plan', ok: true },
      { label: 'Tax clearance', ok: true },
    ],
    compliance: [{ item: 'Boundary vs cadastral survey', status: 'pass' }],
  },
  {
    id: 'a5',
    ref: 'APP-2026-0344',
    applicant: 'National Housing Authority',
    parcelRef: 'PCL-4828',
    type: 'Socialized housing (60 units)',
    submittedOn: '2026-05-22',
    stage: 'decision',
    officer: 'Eng. P. Ramos',
    estCompletion: '2026-06-30',
    aiPreScreenScore: 0.83,
    checklist: [
      { label: 'Certified true copy of title', ok: true },
      { label: 'Subdivision plan', ok: true },
      { label: 'ECC', ok: true },
      { label: 'Barangay clearance', ok: true },
    ],
    compliance: [
      { item: 'Land use vs zoning', status: 'pass' },
      { item: 'Density allowance', status: 'pass' },
      {
        item: 'Water-supply adequacy',
        status: 'flag',
        regulation: 'PD 1096',
        detail: 'Projected demand exceeds current main capacity; conditional approval advised.',
      },
    ],
  },
]

/** Citizen-portal status tracker (US-009) sample. */
export const citizenTracker = {
  ref: 'APP-2026-0418',
  applicant: 'Riverside Devt. Partners',
  type: 'Residential subdivision (24 lots)',
  currentStage: 'pre-screening' as PermitStage,
  officer: 'Eng. P. Ramos',
  estCompletion: '2026-07-28',
  timeline: [
    { stage: 'Submitted', date: '2026-06-20', done: true },
    { stage: 'AI pre-screening', date: '2026-06-20', done: true },
    { stage: 'Compliance review', date: 'In progress', done: false },
    { stage: 'Inspection', date: 'Pending', done: false },
    { stage: 'Decision', date: 'Est. 2026-07-28', done: false },
  ],
}

/** Canned AI chatbot exchange for the citizen portal (US-009). */
export const chatbotScript: ChatMessage[] = [
  { from: 'citizen', text: 'How long until my subdivision permit is approved?' },
  {
    from: 'ai',
    text: 'Your application APP-2026-0418 is at AI pre-screening. Based on 42 similar subdivision applications, the typical remaining time is 5–6 weeks. Estimated decision: 28 Jul 2026.',
  },
  { from: 'citizen', text: 'Is anything missing from my application?' },
  {
    from: 'ai',
    text: 'Two items need attention: (1) Environmental Compliance Certificate is not attached, and (2) your Barangay clearance expired in 2025. Uploading both will avoid delays.',
  },
]

export const quickReplies = [
  'What documents are missing?',
  'Who is my assigned officer?',
  'How do I appeal a decision?',
]
