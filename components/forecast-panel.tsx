'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react'
import type { TrackingOrder, MoldData, MachineStats } from '@/lib/types'
import { MOLDING_TIME_ROUTING } from '@/lib/types'

interface ForecastPanelProps {
  trackingData: TrackingOrder[]
  moldData: MoldData[]
  machineStats: MachineStats[]
}

interface ForecastResult {
  orderId: string
  brand: string
  moldType: string
  totalQty: number
  estimatedHours: number
  estimatedCompletionDate: Date
  currentMoldsOnMachine: number
  requiredMoldChanges: number
  status: 'on_track' | 'at_risk' | 'delayed'
  ppcFinishDate: string | null
  sizes: { size: string; qty: number; estimatedHours: number }[]
}

export function ForecastPanel({ trackingData, moldData, machineStats }: ForecastPanelProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'completion' | 'quantity' | 'risk'>('completion')

  // Get unique brands
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>()
    trackingData.forEach(o => brands.add(o.brand))
    return Array.from(brands).sort()
  }, [trackingData])

  // Calculate molds currently on machines by mold type
  const moldsOnMachine = useMemo(() => {
    const moldMap = new Map<string, number>()
    for (const mold of moldData) {
      const current = moldMap.get(mold.moldId) || 0
      moldMap.set(mold.moldId, current + mold.quantity)
    }
    return moldMap
  }, [moldData])

  // Calculate production capacity per hour per mold type
  const getProductionRate = (moldType: string): number => {
    // Extract base mold ID (remove LAYER suffix etc)
    const baseMoldId = moldType.split(' ')[0]
    return MOLDING_TIME_ROUTING[baseMoldId] || MOLDING_TIME_ROUTING['default']
  }

  // Calculate forecast for each pending order
  const forecasts = useMemo(() => {
    const results: ForecastResult[] = []
    const pendingOrders = trackingData.filter(o => !o.moldOutPRO)

    for (const order of pendingOrders) {
      const moldCount = moldsOnMachine.get(order.moldType) || 0
      const productionRate = getProductionRate(order.moldType)
      
      // Calculate estimated hours based on sizes
      const sizeBreakdown: { size: string; qty: number; estimatedHours: number }[] = []
      let totalEstimatedHours = 0
      
      for (const [size, qty] of Object.entries(order.sizes)) {
        if (qty > 0) {
          // Estimate: productionRate pairs per hour per mold
          // If mold is on machine, use actual count, else assume 1 mold
          const effectiveMolds = Math.max(1, moldCount)
          const hoursForSize = qty / (productionRate * effectiveMolds)
          sizeBreakdown.push({ size, qty, estimatedHours: hoursForSize })
          totalEstimatedHours += hoursForSize
        }
      }

      // Calculate completion date
      const now = new Date()
      const completionDate = new Date(now.getTime() + totalEstimatedHours * 60 * 60 * 1000)

      // Determine status based on PPC finish date
      let status: 'on_track' | 'at_risk' | 'delayed' = 'on_track'
      if (order.finishDatePPC) {
        const ppcDate = new Date(order.finishDatePPC)
        const daysUntilPPC = (ppcDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        const daysToComplete = totalEstimatedHours / 24

        if (daysToComplete > daysUntilPPC) {
          status = 'delayed'
        } else if (daysToComplete > daysUntilPPC * 0.8) {
          status = 'at_risk'
        }
      }

      // Check if mold type needs to be changed
      const requiredMoldChanges = moldCount === 0 ? 1 : 0

      results.push({
        orderId: order.rpro,
        brand: order.brand,
        moldType: order.moldType,
        totalQty: order.qtyOrder,
        estimatedHours: totalEstimatedHours,
        estimatedCompletionDate: completionDate,
        currentMoldsOnMachine: moldCount,
        requiredMoldChanges,
        status,
        ppcFinishDate: order.finishDatePPC,
        sizes: sizeBreakdown.sort((a, b) => parseFloat(a.size) - parseFloat(b.size))
      })
    }

    // Sort results
    results.sort((a, b) => {
      if (sortBy === 'completion') {
        return a.estimatedCompletionDate.getTime() - b.estimatedCompletionDate.getTime()
      } else if (sortBy === 'quantity') {
        return b.totalQty - a.totalQty
      } else {
        // Risk priority: delayed > at_risk > on_track
        const riskOrder = { delayed: 0, at_risk: 1, on_track: 2 }
        return riskOrder[a.status] - riskOrder[b.status]
      }
    })

    // Filter by brand
    if (selectedBrand !== 'all') {
      return results.filter(r => r.brand === selectedBrand)
    }

    return results
  }, [trackingData, moldsOnMachine, selectedBrand, sortBy])

  // Summary statistics
  const summary = useMemo(() => {
    const onTrack = forecasts.filter(f => f.status === 'on_track').length
    const atRisk = forecasts.filter(f => f.status === 'at_risk').length
    const delayed = forecasts.filter(f => f.status === 'delayed').length
    const totalHours = forecasts.reduce((sum, f) => sum + f.estimatedHours, 0)
    const totalPairs = forecasts.reduce((sum, f) => sum + f.totalQty, 0)
    const moldChangesNeeded = forecasts.filter(f => f.requiredMoldChanges > 0).length

    return { onTrack, atRisk, delayed, totalHours, totalPairs, moldChangesNeeded }
  }, [forecasts])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'delayed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Badge className="bg-emerald-100 text-emerald-800">On Track</Badge>
      case 'at_risk':
        return <Badge className="bg-amber-100 text-amber-800">At Risk</Badge>
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800">Delayed</Badge>
      default:
        return null
    }
  }

  const formatHours = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours.toFixed(0)}h`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Production Forecast & Analysis</h2>
        <div className="flex gap-2">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {uniqueBrands.map(brand => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completion">By Completion</SelectItem>
              <SelectItem value="quantity">By Quantity</SelectItem>
              <SelectItem value="risk">By Risk Level</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div className="text-2xl font-bold text-emerald-600">{summary.onTrack}</div>
            </div>
            <p className="text-xs text-muted-foreground">On Track</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div className="text-2xl font-bold text-amber-600">{summary.atRisk}</div>
            </div>
            <p className="text-xs text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{summary.delayed}</div>
            </div>
            <p className="text-xs text-muted-foreground">Delayed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-2xl font-bold">{formatHours(summary.totalHours)}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Est. Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{summary.totalPairs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Pairs</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{summary.moldChangesNeeded}</div>
            <p className="text-xs text-muted-foreground">Mold Changes Needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Forecasts ({forecasts.length} orders)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Mold Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Molds Active</TableHead>
                  <TableHead className="text-right">Est. Time</TableHead>
                  <TableHead>Est. Completion</TableHead>
                  <TableHead>PPC Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.slice(0, 100).map((forecast, idx) => (
                  <TableRow key={idx} className={
                    forecast.status === 'delayed' ? 'bg-red-50' :
                    forecast.status === 'at_risk' ? 'bg-amber-50' : ''
                  }>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(forecast.status)}
                        {getStatusBadge(forecast.status)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      {forecast.orderId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{forecast.brand}</Badge>
                    </TableCell>
                    <TableCell>{forecast.moldType}</TableCell>
                    <TableCell className="text-right">
                      {forecast.totalQty.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {forecast.currentMoldsOnMachine > 0 ? (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {forecast.currentMoldsOnMachine}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Need Setup
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatHours(forecast.estimatedHours)}
                    </TableCell>
                    <TableCell>
                      {forecast.estimatedCompletionDate.toLocaleDateString('vi-VN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className="text-xs">
                      {forecast.ppcFinishDate || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {forecasts.length > 100 && (
              <p className="text-center py-4 text-muted-foreground">
                Showing 100 of {forecasts.length} orders
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mold Change Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended Mold Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecasts
              .filter(f => f.requiredMoldChanges > 0)
              .slice(0, 10)
              .map((forecast, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{forecast.moldType}</p>
                    <p className="text-sm text-muted-foreground">
                      For {forecast.orderId} - {forecast.brand}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{forecast.totalQty.toLocaleString()} pairs</p>
                    <p className="text-sm text-muted-foreground">
                      Est. {formatHours(forecast.estimatedHours)}
                    </p>
                  </div>
                </div>
              ))
            }
            {forecasts.filter(f => f.requiredMoldChanges > 0).length === 0 && (
              <p className="text-center py-4 text-muted-foreground">
                All required molds are currently on machines.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
