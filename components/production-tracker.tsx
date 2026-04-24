'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import type { TrackingOrder, MoldRequirement } from '@/lib/types'

interface ProductionTrackerProps {
  trackingData: TrackingOrder[]
  requirements: {
    afterLamination: MoldRequirement[]
    afterCutting: MoldRequirement[]
    moldingIn: MoldRequirement[]
  }
}

export function ProductionTracker({ trackingData, requirements }: ProductionTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [brandFilter, setBrandFilter] = useState<string>('all')

  // Get unique brands
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>()
    trackingData.forEach(o => brands.add(o.brand))
    return Array.from(brands).sort()
  }, [trackingData])

  // Get unique statuses
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>()
    trackingData.forEach(o => statuses.add(o.status))
    return Array.from(statuses).sort()
  }, [trackingData])

  // Filter orders
  const filteredOrders = useMemo(() => {
    return trackingData.filter(order => {
      const matchesSearch = 
        order.rpro.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.moldType.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesBrand = brandFilter === 'all' || order.brand === brandFilter
      
      return matchesSearch && matchesStatus && matchesBrand
    })
  }, [trackingData, searchTerm, statusFilter, brandFilter])

  // Get stage progress
  const getStageProgress = (order: TrackingOrder) => {
    let progress = 0
    if (order.receivedMaterial) progress += 10
    if (order.laminationPRO) progress += 15
    if (order.prePRO) progress += 20
    if (order.moldInPRO) progress += 25
    if (order.moldOutPRO) progress += 30
    return progress
  }

  const getStageLabel = (order: TrackingOrder) => {
    if (order.moldOutPRO) return { label: 'Completed', color: 'bg-emerald-500' }
    if (order.moldInPRO) return { label: 'Molding', color: 'bg-blue-500' }
    if (order.prePRO) return { label: 'After Cutting', color: 'bg-amber-500' }
    if (order.laminationPRO) return { label: 'After Lamination', color: 'bg-orange-500' }
    if (order.receivedMaterial) return { label: 'Material Ready', color: 'bg-gray-500' }
    return { label: 'Pending', color: 'bg-gray-300' }
  }

  const getStatusBadge = (status: string) => {
    if (status.includes('MOLDING')) return 'default'
    if (status.includes('PACKING') || status.includes('STORED')) return 'secondary'
    if (status.includes('LEAN')) return 'outline'
    return 'outline'
  }

  // Statistics
  const stats = useMemo(() => {
    const total = filteredOrders.length
    const inMolding = filteredOrders.filter(o => o.moldInPRO && !o.moldOutPRO).length
    const afterCutting = filteredOrders.filter(o => o.prePRO && !o.moldInPRO).length
    const afterLamination = filteredOrders.filter(o => o.laminationPRO && !o.prePRO).length
    const completed = filteredOrders.filter(o => o.moldOutPRO).length
    const totalQty = filteredOrders.reduce((sum, o) => sum + o.qtyOrder, 0)
    
    return { total, inMolding, afterCutting, afterLamination, completed, totalQty }
  }, [filteredOrders])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Production Tracker</h2>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search PO, brand, mold..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
          <Select value={brandFilter} onValueChange={setBrandFilter}>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {uniqueStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-orange-600">{stats.afterLamination}</div>
            <p className="text-xs text-muted-foreground">After Lamination</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{stats.afterCutting}</div>
            <p className="text-xs text-muted-foreground">After Cutting</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inMolding}</div>
            <p className="text-xs text-muted-foreground">In Molding</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalQty.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Pairs</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order List ({filteredOrders.length} orders)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RPRO</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Mold Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Finish Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.slice(0, 100).map((order, idx) => {
                  const stage = getStageLabel(order)
                  const progress = getStageProgress(order)
                  
                  return (
                    <Dialog key={idx}>
                      <DialogTrigger asChild>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium text-xs">
                            {order.rpro}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.brand}</Badge>
                          </TableCell>
                          <TableCell>{order.moldType}</TableCell>
                          <TableCell className="text-right">
                            {order.qtyOrder.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                              <span className="text-xs">{stage.label}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress value={progress} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(order.status) as 'default' | 'secondary' | 'outline'} className="text-xs">
                              {order.status.split('.')[1] || order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {order.finishDatePPC}
                          </TableCell>
                        </TableRow>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{order.rpro}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Brand</p>
                              <p className="font-medium">{order.brand}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Customer</p>
                              <p className="font-medium text-sm">{order.customer}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Mold Type</p>
                              <p className="font-medium">{order.moldType}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Quantity</p>
                              <p className="font-medium">{order.qtyOrder.toLocaleString()} pairs</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Gender</p>
                              <p className="font-medium">{order.gender}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <Badge>{order.status}</Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">Production Timeline</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex justify-between p-2 bg-muted rounded">
                                <span>Lamination (PRO)</span>
                                <span>{order.laminationPRO || '-'}</span>
                              </div>
                              <div className="flex justify-between p-2 bg-muted rounded">
                                <span>Cutting (PRO)</span>
                                <span>{order.prePRO || '-'}</span>
                              </div>
                              <div className="flex justify-between p-2 bg-muted rounded">
                                <span>Mold In (PRO)</span>
                                <span>{order.moldInPRO || '-'}</span>
                              </div>
                              <div className="flex justify-between p-2 bg-muted rounded">
                                <span>Mold Out (PRO)</span>
                                <span>{order.moldOutPRO || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">Size Breakdown</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(order.sizes)
                                .filter(([_, qty]) => qty > 0)
                                .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                                .map(([size, qty]) => (
                                  <Badge key={size} variant="outline">
                                    {size}: {qty}
                                  </Badge>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                })}
              </TableBody>
            </Table>
            {filteredOrders.length > 100 && (
              <p className="text-center py-4 text-muted-foreground">
                Showing 100 of {filteredOrders.length} orders
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
