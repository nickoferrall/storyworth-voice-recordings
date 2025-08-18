import { useDroppable } from '@dnd-kit/core'
import { ReactNode } from 'react'
import { CsvRow } from './CsvUploader'

type TeamCardProps = {
  team: { id: string; members: CsvRow[] }
  index: number
  teamSize: number
  children: ReactNode
}

export const TeamCard = ({ team, index, teamSize, children }: TeamCardProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg w-full border p-4 ${isOver ? 'border-blue-500 bg-blue-50' : ''} ${
        team.members.length === teamSize ? 'border-green-500' : 'border-yellow-500'
      }`}
    >
      <h3 className="font-medium">
        Team {index + 1} ({team.members.length}/{teamSize})
      </h3>
      <ul className="mt-2 space-y-2">{children}</ul>
    </div>
  )
}
