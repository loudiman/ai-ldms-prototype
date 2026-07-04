import type { SoilReading, DeforestationAlert } from '../types'
import { parcels, REGION_CENTER } from './parcels'

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function forecast(start: number, slope: number) {
  return MONTHS.map((m, i) => ({
    month: m,
    riskIndex: Math.max(0, Math.min(100, Math.round(start + slope * i + Math.sin(i) * 3))),
  }))
}

export const soilReadings: SoilReading[] = [
  {
    parcelRef: parcels[5]?.ref ?? 'PCL-4805',
    ph: 6.4,
    nitrogen: 38,
    phosphorus: 21,
    organicMatter: 3.4,
    forecast: forecast(28, 1.4),
    status: 'healthy',
  },
  {
    parcelRef: parcels[9]?.ref ?? 'PCL-4809',
    ph: 5.3,
    nitrogen: 19,
    phosphorus: 12,
    organicMatter: 1.8,
    forecast: forecast(46, 3.1),
    status: 'watch',
  },
  {
    parcelRef: parcels[14]?.ref ?? 'PCL-4814',
    ph: 4.8,
    nitrogen: 11,
    phosphorus: 8,
    organicMatter: 1.1,
    forecast: forecast(63, 2.6),
    status: 'alert',
  },
  {
    parcelRef: parcels[18]?.ref ?? 'PCL-4818',
    ph: 6.8,
    nitrogen: 44,
    phosphorus: 27,
    organicMatter: 4.1,
    forecast: forecast(22, 0.8),
    status: 'healthy',
  },
]

export const deforestationAlerts: DeforestationAlert[] = [
  {
    id: 'df1',
    detectedOn: '2026-06-24',
    areaHa: 12.4,
    lat: REGION_CENTER[0] + 0.013,
    lng: REGION_CENTER[1] - 0.011,
    parcelRef: 'PCL-4807',
    owner: 'Highland Forestry Co.',
    severity: 'critical',
    confidence: 0.94,
    status: 'new',
    ndviBefore: 0.78,
    ndviAfter: 0.31,
  },
  {
    id: 'df2',
    detectedOn: '2026-06-21',
    areaHa: 4.7,
    lat: REGION_CENTER[0] + 0.018,
    lng: REGION_CENTER[1] + 0.006,
    parcelRef: 'PCL-4802',
    owner: 'C. Navarro',
    severity: 'moderate',
    confidence: 0.88,
    status: 'investigating',
    ndviBefore: 0.71,
    ndviAfter: 0.49,
  },
  {
    id: 'df3',
    detectedOn: '2026-06-17',
    areaHa: 1.9,
    lat: REGION_CENTER[0] + 0.009,
    lng: REGION_CENTER[1] - 0.004,
    parcelRef: 'PCL-4811',
    owner: 'Greenfield Estates Inc.',
    severity: 'minor',
    confidence: 0.82,
    status: 'new',
    ndviBefore: 0.66,
    ndviAfter: 0.52,
  },
  {
    id: 'df4',
    detectedOn: '2026-06-10',
    areaHa: 8.1,
    lat: REGION_CENTER[0] + 0.021,
    lng: REGION_CENTER[1] - 0.016,
    parcelRef: 'PCL-4801',
    owner: 'Highland Forestry Co.',
    severity: 'critical',
    confidence: 0.91,
    status: 'escalated',
    ndviBefore: 0.8,
    ndviAfter: 0.27,
  },
]

export const soilThresholds = {
  ph: { min: 5.5, max: 7.5 },
  nitrogen: { min: 20 },
  phosphorus: { min: 15 },
  organicMatter: { min: 2.0 },
}
