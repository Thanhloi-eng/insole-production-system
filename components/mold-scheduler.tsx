'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { MachineStats, MoldData, MoldRequirement } from '@/lib/types'
import { getAvailableSizes } from '@/lib/data-parser'

interface MoldSchedulerProps {
  machineStats: MachineStats[]
  moldData: MoldData[]
  requirements: {
    afterLamination: MoldRequirement[]
    afterCutting: MoldRequirement[]
    moldingIn: MoldRequirement[]
  }
  uniqueMoldIds: string[]
}

export function MoldScheduler({ 
  machineStats, 
  moldData, 
  requirements,
  uniqueMoldIds 
}: MoldSchedulerProps) {
  const [selectedStage, setSelectedStage] = useState<'all' | 'after_lamination' | 'after_cutting' | 'molding_in'>('all')
  const [selectedMold, setSelectedMold] = useState<string>('all')
  const [expandedMolds, setExpandedMolds] = useState<Set<string>>(new Set())

  // Get current molds on machines by mold ID
  const currentMoldsOnMachine = useMemo(() => {
    const moldMap = new Map<string, { 
      machines: string[], 
      sizes: Map<string, number>,
      totalQuantity: number 
    }>()
    
    for (const mold of moldData) {
      if (!moldMap.has(mold.moldId)) {
        moldMap.set(mold.moldId, { 
          machines: [], 
          sizes: new Map(),
          totalQuantity: 0 
        })
      }
      const data = moldMap.get(mold.moldId)!
      if (!data.machines.includes(mold.machineId)) {
        data.machines.push(mold.machineId)
      }
      const currentQty = data.sizes.get(mold.moldSize) || 0
      data.sizes.set(mold.moldSize, currentQty + mold.quantity)
      data.totalQuantity += mold.quantity
    }
    
    return moldMap
  }, [moldData])

  // Combine and filter requirements
  const allRequirements = useMemo(() => {
    let reqs: MoldRequirement[] = []
    
    if (selectedStage === 'all' || selectedStage === 'after_lamination') {
      reqs = [...reqs, ...requirements.afterLamination]
    }
    if (selectedStage === 'all' || selectedStage === 'after_cutting') {
      reqs = [...reqs, ...requirements.afterCutting]
    }
    if (selectedStage === 'all' || selectedStage === 'molding_in') {
      reqs = [...reqs, ...requirements.moldingIn]
    }
    
    if (selectedMold !== 'all') {
      reqs = reqs.filter(r => r.moldId === selectedMold)
    }
    
    return reqs
  }, [requirements, selectedStage, selectedMold])

  // Calculate mold availability vs requirements
  const moldAnalysis = useMemo(() => {
    const analysis: Array<{
      moldId: string
      required: { size: string; quantity: number }[]
      available: { size: string; quantity: number; machines: string[] }[]
      totalRequired: number
      totalAvailable: number
      shortage: { size: string; quantity: number }[]
      stage: string
    }> = []

    for (const req of allRequirements) {
      const currentMold = currentMoldsOnMachine.get(req.moldId)
      const available: { size: string; quantity: number; machines: string[] }[] = []
      const shortage: { size: string; quantity: number }[] = []
      
      // Get all available sizes for this mold
      const availableSizes = getAvailableSizes(moldData, req.moldId)
      
      for (const sizeData of req.sizes) {
        // Find matching available size
        const machinesWithSize = moldData.filter(m => 
          m.moldId === req.moldId && m.moldSize === sizeData.size
        )
        
        const totalAvailableQty = machinesWithSize.reduce((sum, m) => sum + m.quantity, 0)
        const machines = [...new Set(machinesWithSize.map(m => m.machineId))]
        
        available.push({
          size: sizeData.size,
          quantity: totalAvailableQty,
          machines
        })
        
        if (totalAvailableQty < sizeData.quantity) {
          shortage.push({
            size: sizeData.size,
            quantity: sizeData.quantity - totalAvailableQty
          })
        }
      }

      analysis.push({
        moldId: req.moldId,
        required: req.sizes,
        available,
        totalRequired: req.totalQuantity,
        totalAvailable: currentMold?.totalQuantity || 0,
        shortage,
        stage: req.stage === 'after_lamination' ? 'After Lamination' :
               req.stage === 'after_cutting' ? 'After Cutting' : 'Molding In'
      })
    }

    return analysis
  }, [allRequirements, currentMoldsOnMachine, moldData])

  const toggleExpanded = (moldId: string) => {
    const newExpanded = new Set(expandedMolds)
    if (newExpanded.has(moldId)) {
      newExpanded.delete(moldId)
    } else {
      newExpanded.add(moldId)
    }
    setExpandedMolds(newExpanded)
  }

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'After Lamination': return 'bg-blue-100 text-blue-800'
      case 'After Cutting': return 'bg-amber-100 text-amber-800'
      case 'Molding In': return 'bg-emerald-100 text-emerald-800'
      default: return ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Mold Scheduling & Requirements</h2>
        <div className="flex gap-2">
          <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as typeof selectedStage)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="after_lamination">After Lamination</SelectItem>
              <SelectItem value="after_cutting">After Cutting</SelectItem>
              <SelectItem value="molding_in">Molding In</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedMold} onValueChange={setSelectedMold}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select mold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Molds</SelectItem>
              {uniqueMoldIds.map(moldId => (
                <SelectItem key={moldId} value={moldId}>{moldId}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">After Lamination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {requirements.afterLamination.length}
            </div>
            <p className="text-xs text-blue-700">
              {requirements.afterLamination.reduce((sum, r) => sum + r.totalQuantity, 0)} pairs needed
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800">After Cutting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {requirements.afterCutting.length}
            </div>
            <p className="text-xs text-amber-700">
              {requirements.afterCutting.reduce((sum, r) => sum + r.totalQuantity, 0)} pairs needed
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800">Molding In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {requirements.moldingIn.length}
            </div>
            <p className="text-xs text-emerald-700">
              {requirements.moldingIn.reduce((sum, r) => sum + r.totalQuantity, 0)} pairs needed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mold Requirements List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mold Requirements Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {moldAnalysis.map((analysis, idx) => (
                <Collapsible
                  key={`${analysis.moldId}-${analysis.stage}-${idx}`}
                  open={expandedMolds.has(`${analysis.moldId}-${idx}`)}
                  onOpenChange={() => toggleExpanded(`${analysis.moldId}-${idx}`)}
                >
                  <Card className={analysis.shortage.length > 0 ? 'border-red-200' : 'border-emerald-200'}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer py-3 hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedMolds.has(`${analysis.moldId}-${idx}`) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-semibold">{analysis.moldId}</span>
                            <Badge className={getStageBadgeColor(analysis.stage)}>
                              {analysis.stage}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            {analysis.shortage.length > 0 ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">{analysis.shortage.length} size shortage</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm">Available</span>
                              </div>
                            )}
                            <Badge variant="outline">
                              {analysis.totalRequired} pairs
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Size</TableHead>
                              <TableHead className="text-right">Required</TableHead>
                              <TableHead className="text-right">Available</TableHead>
                              <TableHead className="text-right">Shortage</TableHead>
                              <TableHead>Machines</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analysis.required.map((req, sIdx) => {
                              const avail = analysis.available.find(a => a.size === req.size)
                              const short = analysis.shortage.find(s => s.size === req.size)
                              return (
                                <TableRow key={sIdx}>
                                  <TableCell className="font-medium">{req.size}</TableCell>
                                  <TableCell className="text-right">{req.quantity}</TableCell>
                                  <TableCell className="text-right">
                                    {avail?.quantity || 0}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {short ? (
                                      <span className="text-red-600 font-medium">-{short.quantity}</span>
                                    ) : (
                                      <span className="text-emerald-600">OK</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {avail?.machines.length ? (
                                      <div className="flex flex-wrap gap-1">
                                        {avail.machines.map(m => (
                                          <Badge key={m} variant="outline" className="text-xs">
                                            {m}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-sm">Not on machine</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}

              {moldAnalysis.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No requirements found for the selected filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
