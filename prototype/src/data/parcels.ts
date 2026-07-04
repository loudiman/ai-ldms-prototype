import type { Parcel, BoundaryDispute, LandUse, FloodRisk } from '../types'

// ---------------------------------------------------------------------------
// Deterministic mock cadastre for the "Malinao Valley District".
// Coordinates are real (Laguna, PH region) so the basemap looks plausible,
// but every parcel, owner and AI output here is fabricated demo data.
// ---------------------------------------------------------------------------

/** Seeded PRNG (mulberry32) so the generated map is identical on every load. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260626)

export const REGION_CENTER: [number, number] = [14.205, 121.105]

const OWNERS = [
  'Reyes Family Trust', 'M. Santos', 'Bautista Agri Corp.', 'L. Dela Cruz',
  'Aquino Holdings', 'Greenfield Estates Inc.', 'R. Mercado', 'Villanueva & Sons',
  'Provincial Government', 'C. Navarro', 'Highland Forestry Co.', 'D. Gutierrez',
  'Malinao Cooperative', 'P. Ramos', 'Riverside Devt. Partners', 'T. Flores',
  'National Housing Authority', 'S. Domingo', 'Ortega Trading', 'B. Castillo',
]

const ZONING: Record<LandUse, string> = {
  agricultural: 'A-1 Agricultural',
  forest: 'CF Conservation Forest',
  urban: 'U-2 Mixed Urban',
  wetland: 'PZ Protection Zone',
  residential: 'R-1 Residential',
  commercial: 'C-1 Commercial',
  industrial: 'I-1 Light Industrial',
  vacant: 'UD Undesignated',
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function landUseForCell(col: number, row: number): LandUse {
  // North band → forest, diagonal river → wetland, centre → urban cluster,
  // south → agricultural, with scattered residential/commercial/industrial.
  const onRiver = Math.abs(col - row) <= 0 || Math.abs(col - (row - 1)) === 0
  if (onRiver && rand() < 0.7) return 'wetland'
  if (row <= 1) return rand() < 0.8 ? 'forest' : 'vacant'
  if (row >= 6) return rand() < 0.85 ? 'agricultural' : 'vacant'
  if (col >= 3 && col <= 5 && row >= 3 && row <= 4) {
    return pick<LandUse>(['urban', 'commercial', 'residential', 'urban'])
  }
  return pick<LandUse>(['agricultural', 'residential', 'agricultural', 'industrial', 'vacant'])
}

function floodForCell(col: number, row: number, use: LandUse): FloodRisk {
  const nearRiver = Math.abs(col - row) <= 1
  if (use === 'wetland') return rand() < 0.6 ? 'extreme' : 'high'
  if (nearRiver) return rand() < 0.5 ? 'high' : 'medium'
  if (row <= 1) return 'low'
  return rand() < 0.5 ? 'low' : 'medium'
}

const COLS = 8
const ROWS = 7
const STEP = 0.006

function buildParcels(): Parcel[] {
  const out: Parcel[] = []
  let n = 0
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      // skip a few cells to break the perfect grid
      if (rand() < 0.08) continue
      n++
      const latC = REGION_CENTER[0] + (ROWS / 2 - row) * STEP
      const lngC = REGION_CENTER[1] + (col - COLS / 2) * STEP
      const hLat = STEP * (0.36 + rand() * 0.08)
      const hLng = STEP * (0.36 + rand() * 0.08)
      const j = () => (rand() - 0.5) * STEP * 0.12
      const ring: [number, number][] = [
        [latC - hLat + j(), lngC - hLng + j()],
        [latC - hLat + j(), lngC + hLng + j()],
        [latC + hLat + j(), lngC + hLng + j()],
        [latC + hLat + j(), lngC - hLng + j()],
      ]
      const use = landUseForCell(col, row)
      // ~ hectares from the rough rectangle size at this latitude
      const areaHa = +(hLat * hLng * 4 * 111_000 * 111_000 * Math.cos((latC * Math.PI) / 180) / 10_000).toFixed(1)

      // AI classification mostly agrees; sometimes disagrees with lower confidence
      const agrees = rand() < 0.82
      const aiClass = agrees ? use : pick<LandUse>(['agricultural', 'urban', 'forest', 'wetland', 'residential'])
      const aiConfidence = +(agrees ? 0.86 + rand() * 0.13 : 0.55 + rand() * 0.22).toFixed(2)

      const permitRoll = rand()
      const permitStatus: Parcel['permitStatus'] =
        permitRoll < 0.08 ? 'expiring' : permitRoll < 0.13 ? 'expired' : permitRoll < 0.5 ? 'active' : 'none'

      out.push({
        id: `p${n}`,
        ref: `PCL-${4800 + n}`,
        owner: pick(OWNERS),
        areaHa,
        landUse: use,
        zoning: ZONING[use],
        aiClass,
        aiConfidence,
        permitStatus,
        floodRisk: floodForCell(col, row, use),
        indigenousOverlap: false, // set below for NE cluster
        ring,
      })
    }
  }
  return out
}

export const parcels: Parcel[] = buildParcels()

// Mark a north-east cluster as overlapping the indigenous ancestral domain.
for (const p of parcels) {
  const [lat, lng] = p.ring[0]
  if (lat > REGION_CENTER[0] + STEP * 1.5 && lng > REGION_CENTER[1] + STEP * 1.5) {
    p.indigenousOverlap = true
  }
}

export const boundaryDisputes: BoundaryDispute[] = [
  {
    id: 'd1',
    parcelRef: parcels[3]?.ref ?? 'PCL-4803',
    conflictingRef: parcels[4]?.ref ?? 'PCL-4804',
    severity: 'critical',
    detectedOn: '2026-06-22',
    overlapHa: 0.8,
    description: 'Registered deed boundary extends 0.8 ha into adjacent parcel; double-titling suspected.',
  },
  {
    id: 'd2',
    parcelRef: parcels[11]?.ref ?? 'PCL-4811',
    conflictingRef: parcels[12]?.ref ?? 'PCL-4812',
    severity: 'moderate',
    detectedOn: '2026-06-19',
    overlapHa: 0.3,
    description: 'GIS survey shows 0.3 ha overlap inconsistent with the latest subdivision plan.',
  },
  {
    id: 'd3',
    parcelRef: parcels[20]?.ref ?? 'PCL-4820',
    conflictingRef: parcels[21]?.ref ?? 'PCL-4821',
    severity: 'minor',
    detectedOn: '2026-06-15',
    overlapHa: 0.1,
    description: 'Minor fence-line discrepancy flagged for surveyor verification.',
  },
]

/** Parcels whose AI classification disagrees with the recorded land use. */
export const reclassifyCandidates = parcels.filter((p) => p.aiClass !== p.landUse)
