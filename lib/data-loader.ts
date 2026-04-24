import { promises as fs } from 'fs'
import path from 'path'
import { parseMoldData, parseTrackingData } from './data-parser'
import type { MoldData, TrackingOrder } from './types'

export async function loadMoldData(): Promise<MoldData[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'mold-data.txt')
    const data = await fs.readFile(filePath, 'utf-8')
    return parseMoldData(data)
  } catch (error) {
    console.error('Error loading mold data:', error)
    return []
  }
}

export async function loadTrackingData(): Promise<TrackingOrder[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'tracking-data.txt')
    const data = await fs.readFile(filePath, 'utf-8')
    return parseTrackingData(data)
  } catch (error) {
    console.error('Error loading tracking data:', error)
    return []
  }
}
