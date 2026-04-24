import { loadMoldData, loadTrackingData } from '@/lib/data-loader'
import { groupMoldsByMachine, calculateMoldRequirements, getUniqueMoldIds } from '@/lib/data-parser'
import { DashboardWrapper } from '@/components/dashboard-wrapper'

export default async function HomePage() {
  const moldData = await loadMoldData()
  const trackingData = await loadTrackingData()
  
  const machineStats = groupMoldsByMachine(moldData)
  const uniqueMoldIds = getUniqueMoldIds(moldData)
  
  const afterLamination = calculateMoldRequirements(trackingData, 'after_lamination')
  const afterCutting = calculateMoldRequirements(trackingData, 'after_cutting')
  const moldingIn = calculateMoldRequirements(trackingData, 'molding_in')

  return (
    <DashboardWrapper 
      initialMachineStats={machineStats}
      initialMoldData={moldData}
      initialTrackingData={trackingData}
      initialUniqueMoldIds={uniqueMoldIds}
      initialRequirements={{
        afterLamination,
        afterCutting,
        moldingIn
      }}
    />
  )
}
