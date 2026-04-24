'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MachineStats, MoldData } from '@/lib/types'

interface MachineOverviewProps {
  machineStats: MachineStats[]
  moldData: MoldData[]
}

export function MachineOverview({ machineStats, moldData }: MachineOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMachine, setSelectedMachine] = useState<MachineStats | null>(null)

  const filteredMachines = machineStats.filter(machine =>
    machine.machineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.molds.some(m => m.moldId.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getLoadColor = (load: number) => {
    if (load >= 100) return 'bg-red-500'
    if (load >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getLoadBadge = (load: number) => {
    if (load >= 100) return 'destructive'
    if (load >= 80) return 'secondary'
    return 'default'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Machine Status</h2>
        <Input
          placeholder="Search machine or mold..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMachines.map((machine) => (
          <Dialog key={machine.machineId}>
            <DialogTrigger asChild>
              <Card 
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => setSelectedMachine(machine)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {machine.machineId}
                    </CardTitle>
                    <Badge variant={getLoadBadge(machine.loadPercent) as 'default' | 'secondary' | 'destructive'}>
                      {machine.loadPercent}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{machine.machineName}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress 
                      value={machine.loadPercent} 
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{machine.totalMolds} / {machine.maxMolds} molds</span>
                      <span>{machine.molds.length} types</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[...new Set(machine.molds.map(m => m.moldId))].slice(0, 3).map((moldId, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {moldId}
                        </Badge>
                      ))}
                      {[...new Set(machine.molds.map(m => m.moldId))].length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{[...new Set(machine.molds.map(m => m.moldId))].length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {machine.machineId} - {machine.machineName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{machine.loadPercent}%</div>
                      <p className="text-xs text-muted-foreground">Load</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{machine.totalMolds}</div>
                      <p className="text-xs text-muted-foreground">Total Molds</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{machine.maxMolds}</div>
                      <p className="text-xs text-muted-foreground">Max Capacity</p>
                    </CardContent>
                  </Card>
                </div>

                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mold ID</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Running Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {machine.molds.map((mold, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{mold.moldId}</TableCell>
                          <TableCell>{mold.moldSize}</TableCell>
                          <TableCell>{mold.quantity}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                              {mold.statusNote}
                            </Badge>
                          </TableCell>
                          <TableCell>{mold.runningTime}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No machines found matching your search.
        </div>
      )}
    </div>
  )
}
