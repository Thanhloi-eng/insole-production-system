import type { MoldData, TrackingOrder, MachineStats, MoldRequirement } from './types'

// Parse raw mold data from realtimemolds
export function parseMoldData(rawData: string): MoldData[] {
  const lines = rawData.trim().split('\n')
  const molds: MoldData[] = []
  
  // Skip header line (check if first line is header)
  const startIndex = lines[0]?.toLowerCase().includes('machine') ? 1 : 0
  
  for (let i = startIndex; i < lines.length; i++) {
    // Handle both tab-separated and comma-separated
    const cols = lines[i].includes('\t') ? lines[i].split('\t') : lines[i].split(',')
    if (cols.length >= 8) {
      const machineId = cols[0]?.trim() || ''
      const machineName = cols[1]?.trim() || ''
      const status = cols[2]?.trim()?.toLowerCase() || 'active'
      
      molds.push({
        machineId,
        machineName,
        operationalStatus: status as 'active' | 'inactive' | 'maintenance',
        loadPercent: parseInt(cols[3]) || 0,
        maxMolds: parseInt(cols[4]) || 12,
        moldId: cols[5]?.trim() || '',
        moldSize: cols[6]?.trim() || '',
        quantity: parseInt(cols[7]) || 1,
        statusNote: cols[8]?.trim() || 'OK',
        runningTime: cols[9]?.trim() || ''
      })
    }
  }
  
  return molds
}

// Parse tracking list data
export function parseTrackingData(rawData: string): TrackingOrder[] {
  const lines = rawData.trim().split('\n')
  const orders: TrackingOrder[] = []
  
  // Get header to find column indices
  const headerLine = lines[0] || ''
  const headers = headerLine.includes('\t') ? headerLine.split('\t') : headerLine.split(',')
  
  // Find size column start index (TD.S1 or S1)
  const sizeStartIndex = headers.findIndex(h => h.includes('S1') && !h.includes('S1_') && !h.includes('S10') && !h.includes('S11'))
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].includes('\t') ? lines[i].split('\t') : lines[i].split(',')
    if (cols.length < 15) continue
    
    const sizes: Record<string, number> = {}
    
    // Parse size columns - standard shoe sizes from 1 to 15+
    const sizeLabels = [
      '1#', '1.5#', '2#', '2.5#', '3#', '3.5#', '4#', '4.5#', '5#', '5.5#',
      '6#', '6.5#', '7#', '7.5#', '8#', '8.5#', '9#', '9.5#', '10#', '10.5#',
      '11#', '11.5#', '12#', '12.5#', '13#', '13.5#', '14#', '14.5#', '15#', '15.5#',
      '16#', '16.5#', '17#', '18#', '19#', '20#'
    ]
    
    // Start from size column index
    const startCol = sizeStartIndex > 0 ? sizeStartIndex : 20
    for (let j = 0; j < sizeLabels.length && (startCol + j) < cols.length - 2; j++) {
      const val = parseInt(cols[startCol + j]) || 0
      if (val > 0) {
        sizes[sizeLabels[j]] = val
      }
    }
    
    // Parse RPRO - could be col 0 or 1 depending on format
    const rproIndex = headers.findIndex(h => h.includes('RPRO'))
    const brandIndex = headers.findIndex(h => h.includes('Brand'))
    const customerIndex = headers.findIndex(h => h.includes('Customer'))
    const moldTypeIndex = headers.findIndex(h => h.includes('MOLDTYPE'))
    const qtyOrderIndex = headers.findIndex(h => h.includes('QtyOrder'))
    const statusIndex = headers.findIndex(h => h.includes('Status'))
    const genderIndex = headers.findIndex(h => h.includes('Gender'))
    
    orders.push({
      rpro: cols[rproIndex >= 0 ? rproIndex : 0]?.trim() || '',
      brand: cols[brandIndex >= 0 ? brandIndex : 1]?.trim() || '',
      customer: cols[customerIndex >= 0 ? customerIndex : 2]?.trim() || '',
      moldType: cols[moldTypeIndex >= 0 ? moldTypeIndex : 3]?.trim() || '',
      qtyOrder: parseInt(cols[qtyOrderIndex >= 0 ? qtyOrderIndex : 4]) || 0,
      receivedMaterial: cols[5]?.trim() || null,
      laminationPPC: cols[6]?.trim() || null,
      laminationPRO: cols[7]?.trim() || null,
      sawcuttingPPC: cols[8]?.trim() || null,
      prePRO: cols[9]?.trim() || null,
      subReturn: cols[10]?.trim() || null,
      moldInPRO: cols[11]?.trim() || null,
      moldingPPC: cols[12]?.trim() || null,
      moldOutPRO: cols[13]?.trim() || null,
      finishDatePPC: cols[14]?.trim() || null,
      ppcCMF: cols[15]?.trim() || null,
      status: cols[statusIndex >= 0 ? statusIndex : 16]?.trim() || '',
      gender: cols[genderIndex >= 0 ? genderIndex : 17]?.trim() || '',
      descriptionPU1: cols[18]?.trim() || '',
      descriptionFB: cols[19]?.trim() || '',
      sizes,
      delayFinishDate: parseInt(cols[cols.length - 2]) || 0,
      delayMoldingDate: parseInt(cols[cols.length - 1]) || 0
    })
  }
  
  return orders
}

// Group molds by machine
export function groupMoldsByMachine(molds: MoldData[]): MachineStats[] {
  const machineMap = new Map<string, MachineStats>()
  
  for (const mold of molds) {
    if (!machineMap.has(mold.machineId)) {
      machineMap.set(mold.machineId, {
        machineId: mold.machineId,
        machineName: mold.machineName,
        totalMolds: 0,
        loadPercent: mold.loadPercent,
        maxMolds: mold.maxMolds,
        molds: []
      })
    }
    
    const machine = machineMap.get(mold.machineId)!
    machine.molds.push(mold)
    machine.totalMolds += mold.quantity
  }
  
  return Array.from(machineMap.values()).sort((a, b) => 
    a.machineId.localeCompare(b.machineId, undefined, { numeric: true })
  )
}

// Calculate mold requirements based on orders and current stage
export function calculateMoldRequirements(
  orders: TrackingOrder[],
  stage: 'after_lamination' | 'after_cutting' | 'molding_in'
): MoldRequirement[] {
  const requirementMap = new Map<string, MoldRequirement>()
  
  const filteredOrders = orders.filter(order => {
    if (stage === 'after_lamination') {
      return order.laminationPRO && !order.prePRO
    } else if (stage === 'after_cutting') {
      return order.prePRO && !order.moldInPRO
    } else {
      return order.moldInPRO && !order.moldOutPRO
    }
  })
  
  for (const order of filteredOrders) {
    const moldId = order.moldType
    
    if (!requirementMap.has(moldId)) {
      requirementMap.set(moldId, {
        moldId,
        sizes: [],
        totalQuantity: 0,
        orders: [],
        stage
      })
    }
    
    const req = requirementMap.get(moldId)!
    req.orders.push(order.rpro)
    
    for (const [size, qty] of Object.entries(order.sizes)) {
      const existingSize = req.sizes.find(s => s.size === size)
      if (existingSize) {
        existingSize.quantity += qty
      } else {
        req.sizes.push({ size, quantity: qty })
      }
      req.totalQuantity += qty
    }
  }
  
  return Array.from(requirementMap.values())
}

// Get unique mold IDs from mold data
export function getUniqueMoldIds(molds: MoldData[]): string[] {
  const moldIds = new Set<string>()
  for (const mold of molds) {
    moldIds.add(mold.moldId)
  }
  return Array.from(moldIds).sort()
}

// Get available sizes for a specific mold
export function getAvailableSizes(molds: MoldData[], moldId: string): string[] {
  const sizes = new Set<string>()
  for (const mold of molds) {
    if (mold.moldId === moldId) {
      sizes.add(mold.moldSize)
    }
  }
  return Array.from(sizes).sort((a, b) => {
    const numA = parseFloat(a.replace(/[^0-9.]/g, ''))
    const numB = parseFloat(b.replace(/[^0-9.]/g, ''))
    return numA - numB
  })
}
