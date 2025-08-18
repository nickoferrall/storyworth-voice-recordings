import { useState, useEffect } from 'react'
import { Button } from '../../src/components/ui/button'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensors,
  useSensor,
  PointerSensor,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { TeamCard } from './TeamCard'
import shortUUID from 'short-uuid'
import { CsvRow } from './CsvUploader'
import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Loader2 } from 'lucide-react'

type Props = {
  teams: Array<{ id: string; name: string; members: CsvRow[] }>
  setTeams: (teams: Array<{ id: string; name: string; members: CsvRow[] }>) => void
  selectedTicketType: any
  onUpload: () => Promise<void>
  onShuffle: () => void
  initialUnassigned?: CsvRow[]
  isUploading?: boolean
}

const DraggableMember = ({ member }: { member: CsvRow }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `${member.firstName}-${member.lastName}-${member.email}`,
  })

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center justify-between rounded-md border p-2 cursor-move hover:bg-gray-100"
    >
      <span>
        {member.firstName} {member.lastName}
      </span>
    </li>
  )
}

const UnassignedDroppable = ({
  children,
  memberCount,
}: {
  children: ReactNode
  memberCount: number
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
  })

  return (
    <div
      ref={setNodeRef}
      className={`mt-8 rounded-lg border p-4 ${
        isOver ? 'border-blue-500 bg-blue-50' : ''
      }`}
    >
      <h3 className="font-medium">Unassigned Members ({memberCount})</h3>
      <ul className="mt-2 space-y-2">{children}</ul>
    </div>
  )
}

export const TeamGenerator = ({
  teams,
  setTeams,
  selectedTicketType,
  onUpload,
  onShuffle,
  initialUnassigned = [],
  isUploading = false,
}: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [unassignedMembers, setUnassignedMembers] = useState<CsvRow[]>(initialUnassigned)

  useEffect(() => {
    // Remove the last team if it was moved to unassigned
    if (unassignedMembers.length > 0) {
      setTeams(teams.slice(0, -1))
    }
  }, []) // Run only once on mount

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeMemberId = active.id as string
    const overTeamId = over.id as string

    // Find the member and their current location (team or unassigned)
    let activeMember: CsvRow | undefined
    let sourceTeamIndex = -1
    let sourceMemberIndex = -1

    // Check teams first
    teams.forEach((team, teamIndex) => {
      const memberIndex = team.members.findIndex(
        (m) => `${m.firstName}-${m.lastName}-${m.email}` === activeMemberId,
      )
      if (memberIndex !== -1) {
        activeMember = team.members[memberIndex]
        sourceTeamIndex = teamIndex
        sourceMemberIndex = memberIndex
      }
    })

    // Check unassigned members if not found in teams
    if (!activeMember) {
      const unassignedIndex = unassignedMembers.findIndex(
        (m) => `${m.firstName}-${m.lastName}-${m.email}` === activeMemberId,
      )
      if (unassignedIndex !== -1) {
        activeMember = unassignedMembers[unassignedIndex]
        sourceMemberIndex = unassignedIndex
      }
    }

    if (!activeMember) return

    const newTeams = [...teams]
    const newUnassigned = [...unassignedMembers]

    // Remove from source
    if (sourceTeamIndex !== -1) {
      newTeams[sourceTeamIndex].members.splice(sourceMemberIndex, 1)
    } else {
      newUnassigned.splice(sourceMemberIndex, 1)
    }

    // Add to destination
    if (overTeamId === 'unassigned') {
      newUnassigned.push(activeMember)
    } else {
      const targetTeamIndex = teams.findIndex((t) => t.id === overTeamId)
      if (targetTeamIndex !== -1) {
        // Check if team is at capacity
        if (newTeams[targetTeamIndex].members.length < selectedTicketType.teamSize) {
          newTeams[targetTeamIndex].members.push(activeMember)
        } else {
          // If team is full, move to unassigned
          newUnassigned.push(activeMember)
        }
      }
    }

    // Clean up empty teams
    const filteredTeams = newTeams.filter((team) => team.members.length > 0)

    // Create new team if needed
    if (
      filteredTeams.length <
      Math.ceil(
        (newUnassigned.length + teams.reduce((acc, t) => acc + t.members.length, 0)) /
          selectedTicketType.teamSize,
      )
    ) {
      filteredTeams.push({
        id: shortUUID.generate(),
        members: [],
      })
    }

    setTeams(filteredTeams)
    setUnassignedMembers(newUnassigned)
    setActiveId(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white pb-4">
          <div className="flex items-center justify-between">
            <div>
              <Button onClick={onShuffle} variant="outline">
                Shuffle Teams
              </Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Teams must have exactly {selectedTicketType?.teamSize} members
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {unassignedMembers.length > 0 && (
                <p className="text-sm text-yellow-600">
                  {unassignedMembers.length} unassigned member
                  {unassignedMembers.length > 1 ? 's' : ''} will not be registered
                </p>
              )}
              <Button
                onClick={onUpload}
                disabled={
                  teams.every((t) => t.members.length !== selectedTicketType?.teamSize) ||
                  isUploading
                }
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Create Teams'
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {teams.map((team, index) => (
            <div key={team.id} className="space-y-1">
              <TeamCard team={team} index={index} teamSize={selectedTicketType?.teamSize}>
                {team.members.map((member) => (
                  <DraggableMember
                    key={`${member.firstName}-${member.lastName}-${member.email}`}
                    member={member}
                  />
                ))}
              </TeamCard>
            </div>
          ))}
        </div>

        <UnassignedDroppable memberCount={unassignedMembers.length}>
          {unassignedMembers.map((member) => (
            <DraggableMember
              key={`${member.firstName}-${member.lastName}-${member.email}`}
              member={member}
            />
          ))}
        </UnassignedDroppable>
      </div>

      {/* Move DragOverlay to portal */}
      {typeof window !== 'undefined' &&
        createPortal(
          <DragOverlay>
            {activeId ? (
              <div className="rounded-md border p-2 bg-white shadow-lg">
                {activeId.split('-').slice(0, 2).join(' ')}
              </div>
            ) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  )
}
