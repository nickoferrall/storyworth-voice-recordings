import React, { useEffect } from 'react'
import { useGetEntryNamesByHeatIdLazyQuery } from '../../src/generated/graphql'

type Props = {
 heatId: string
}

const RegistrationBadgeTooltip = ({ heatId }: Props) => {
 const [getEntries, { data, loading }] = useGetEntryNamesByHeatIdLazyQuery({
  variables: { heatId },
 })
 const entries = data?.getLanesByHeatId ?? []

 useEffect(() => {
  getEntries({ variables: { heatId } })
 }, [heatId, getEntries])

 if (loading) {
  return <div className="p-2">Loading...</div>
 }
 return (
  <div className="p-2 max-w-xs">
   <h3 className="text-sm font-semibold mb-2">Registrations</h3>
   {entries.length > 0 ? (
    <ul className="list-disc pl-4 space-y-1">
     {entries.map((entry, index) => (
      <li key={index} className="text-sm">
       {entry.entry.name}
      </li>
     ))}
    </ul>
   ) : (
    <p className="text-sm italic">No athletes registered yet.</p>
   )}
  </div>
 )
}

export default RegistrationBadgeTooltip
