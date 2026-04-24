"use client"

import { useState, useCallback } from "react"
import { Dashboard } from "./dashboard"
import { parseMoldData, parseTrackingData, groupMoldsByMachine, calculateMoldRequirements, getUniqueMoldIds } from "@/lib/data-parser"
import type { MachineStats, MoldData, TrackingOrder, MoldRequirement } from "@/lib/types"

interface DashboardWrapperProps {
  initialMachineStats: MachineStats[]
  initialMoldData: MoldData[]
  initialTrackingData: TrackingOrder[]
  initialUniqueMoldIds: string[]
  initialRequirements: {
    afterLamination: MoldRequirement[]
    afterCutting: MoldRequirement[]
    moldingIn: MoldRequirement[]
  }
}

export function DashboardWrapper({
  initialMachineStats,
  initialMoldData,
  initialTrackingData,
  initialUniqueMoldIds,
  initialRequirements
}: DashboardWrapperProps) {
  const [machineStats, setMachineStats] = useState(initialMachineStats)
  const [moldData, setMoldData] = useState(initialMoldData)
  const [trackingData, setTrackingData] = useState(initialTrackingData)
  const [uniqueMoldIds, setUniqueMoldIds] = useState(initialUniqueMoldIds)
  const [requirements, setRequirements] = useState(initialRequirements)

  const handleDataImported = useCallback((type: "tracking" | "mold", data: string) => {
    if (type === "mold") {
      const newMoldData = parseMoldData(data)
      const newMachineStats = groupMoldsByMachine(newMoldData)
      const newUniqueMoldIds = getUniqueMoldIds(newMoldData)
      
      setMoldData(newMoldData)
      setMachineStats(newMachineStats)
      setUniqueMoldIds(newUniqueMoldIds)
      
      // Save to localStorage for persistence
      localStorage.setItem("moldData", data)
    } else {
      const newTrackingData = parseTrackingData(data)
      const afterLamination = calculateMoldRequirements(newTrackingData, "after_lamination")
      const afterCutting = calculateMoldRequirements(newTrackingData, "after_cutting")
      const moldingIn = calculateMoldRequirements(newTrackingData, "molding_in")
      
      setTrackingData(newTrackingData)
      setRequirements({ afterLamination, afterCutting, moldingIn })
      
      // Save to localStorage for persistence
      localStorage.setItem("trackingData", data)
    }
  }, [])

  return (
    <Dashboard
      machineStats={machineStats}
      moldData={moldData}
      trackingData={trackingData}
      uniqueMoldIds={uniqueMoldIds}
      requirements={requirements}
      onDataImported={handleDataImported}
    />
  )
}
