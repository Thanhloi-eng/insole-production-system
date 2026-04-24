// Types for Mold Scheduling Application

export interface MoldData {
  machineId: string
  machineName: string
  operationalStatus: 'active' | 'inactive' | 'maintenance'
  loadPercent: number
  maxMolds: number
  moldId: string
  moldSize: string
  quantity: number
  statusNote: string
  runningTime: string
}

export interface TrackingOrder {
  rpro: string
  brand: string
  customer: string
  moldType: string
  qtyOrder: number
  receivedMaterial: string | null
  laminationPPC: string | null
  laminationPRO: string | null
  sawcuttingPPC: string | null
  prePRO: string | null
  subReturn: string | null
  moldInPRO: string | null
  moldingPPC: string | null
  moldOutPRO: string | null
  finishDatePPC: string | null
  ppcCMF: string | null
  status: string
  gender: string
  descriptionPU1: string
  descriptionFB: string
  sizes: Record<string, number>
  delayFinishDate: number
  delayMoldingDate: number
}

export interface MachineStats {
  machineId: string
  machineName: string
  totalMolds: number
  loadPercent: number
  maxMolds: number
  molds: MoldData[]
}

export interface MoldRequirement {
  moldId: string
  sizes: { size: string; quantity: number }[]
  totalQuantity: number
  orders: string[]
  stage: 'after_lamination' | 'after_cutting' | 'molding_in'
}

export interface ProductionForecast {
  orderId: string
  moldType: string
  estimatedTime: number // hours
  requiredMolds: { moldId: string; size: string; quantity: number }[]
  completionDate: Date
  stage: string
}

export interface MoldingSizeMapping {
  moldId: string
  availableSizes: string[]
}

// Molding time constants (pairs/hour per mold)
export const MOLDING_TIME_ROUTING: Record<string, number> = {
  'OV-0256': 12,
  'OV-0337': 10,
  'OV-0363': 10,
  'OV-0420': 8,
  'OV-0435': 10,
  'OV-0436': 10,
  'OV-0446': 8,
  'OE-1128': 14,
  'OI-0023': 16,
  'OSC-0003': 12,
  'OV-0394': 10,
  'OV-0408': 10,
  'OV-0419': 10,
  'OV-0428': 10,
  'default': 10
}

// Size conversion for display
export function normalizeSize(size: string): string {
  return size.replace('#', '').trim()
}

export function parseSizeRange(sizeStr: string): string[] {
  // Handle ranges like "5#-6#" or "5.5#-6.5#"
  if (sizeStr.includes('-')) {
    const [start, end] = sizeStr.split('-').map(s => s.replace('#', '').trim())
    const startNum = parseFloat(start)
    const endNum = parseFloat(end)
    const sizes: string[] = []
    for (let i = startNum; i <= endNum; i += 0.5) {
      sizes.push(i.toString() + '#')
    }
    return sizes
  }
  return [sizeStr]
}
