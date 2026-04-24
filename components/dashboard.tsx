'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MachineOverview } from './machine-overview'
import { MoldScheduler } from './mold-scheduler'
import { ProductionTracker } from './production-tracker'
import { ForecastPanel } from './forecast-panel'
import { DataImport } from './data-import'
import { Database } from 'lucide-react'
import type { MachineStats, MoldData, TrackingOrder, MoldRequirement } from '@/lib/types'

interface DashboardProps {
  machineStats: MachineStats[]
  moldData: MoldData[]
  trackingData: TrackingOrder[]
  uniqueMoldIds: string[]
  requirements: {
    afterLamination: MoldRequirement[]
    afterCutting: MoldRequirement[]
    moldingIn: MoldRequirement[]
  }
  onDataImported?: (type: "tracking" | "mold", data: string) => void
}

export function Dashboard({ 
  machineStats, 
  moldData, 
  trackingData, 
  uniqueMoldIds,
  requirements,
  onDataImported
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const totalMachines = machineStats.length
  const activeMachines = machineStats.filter(m => m.loadPercent > 0).length
  const totalMoldsOnMachine = moldData.reduce((sum, m) => sum + m.quantity, 0)
  const pendingOrders = trackingData.filter(o => !o.moldOutPRO).length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Mold Scheduling System</h1>
              <p className="text-sm text-muted-foreground">Molding Insole Production Management</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Machines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMachines}</div>
              <p className="text-xs text-muted-foreground">
                {activeMachines} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Molds on Machines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMoldsOnMachine}</div>
              <p className="text-xs text-muted-foreground">
                {uniqueMoldIds.length} unique mold types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                {trackingData.length} total orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Required Mold Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {requirements.afterLamination.length + requirements.afterCutting.length + requirements.moldingIn.length}
              </div>
              <p className="text-xs text-muted-foreground">
                across 3 stages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Machine Overview</TabsTrigger>
            <TabsTrigger value="scheduler">Mold Scheduler</TabsTrigger>
            <TabsTrigger value="tracker">Production Tracker</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Database className="h-4 w-4" />
              Data Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <MachineOverview machineStats={machineStats} moldData={moldData} />
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-4">
            <MoldScheduler 
              machineStats={machineStats}
              moldData={moldData}
              requirements={requirements}
              uniqueMoldIds={uniqueMoldIds}
            />
          </TabsContent>

          <TabsContent value="tracker" className="space-y-4">
            <ProductionTracker 
              trackingData={trackingData}
              requirements={requirements}
            />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-4">
            <ForecastPanel 
              trackingData={trackingData}
              moldData={moldData}
              machineStats={machineStats}
            />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <DataImport 
              onDataImported={onDataImported || (() => {})}
              currentTrackingCount={trackingData.length}
              currentMoldCount={machineStats.length}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
