import { useState } from 'react'
import { Button } from '../../src/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select'
import { upperFirst } from '../../lib/upperFirst'

type Category = {
  id: string
  difficulty: Difficulty
  gender: Gender
  teamSize: TeamSize
  isSoldOut: boolean
}

type Difficulty = 'ELITE' | 'RX' | 'INTERMEDIATE' | 'EVERYDAY' | 'MASTERS' | 'TEEN'
type Gender = 'MALE' | 'FEMALE' | 'MIXED'
type TeamSize = 1 | 2 | 3 | 4 | 5 | 6

const VALID_DIFFICULTIES: Difficulty[] = [
  'ELITE',
  'RX',
  'INTERMEDIATE',
  'EVERYDAY',
  'MASTERS',
  'TEEN',
]

function AddCategoryForm({ onAdd }: { onAdd: (category: Category) => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('RX')
  const [gender, setGender] = useState<Gender>('MALE')
  const [teamSize, setTeamSize] = useState<TeamSize>(1)

  return (
    <div className="flex gap-2">
      <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {VALID_DIFFICULTIES.map((diff) => (
            <SelectItem key={diff} value={diff}>
              {diff === 'RX' ? 'RX' : upperFirst(diff.toLowerCase())}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MALE">Male</SelectItem>
          <SelectItem value="FEMALE">Female</SelectItem>
          <SelectItem value="MIXED">Mixed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={teamSize.toString()}
        onValueChange={(v) => setTeamSize(parseInt(v) as TeamSize)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Individual</SelectItem>
          <SelectItem value="2">Pairs</SelectItem>
          <SelectItem value="3">Team of 3</SelectItem>
          <SelectItem value="4">Team of 4</SelectItem>
          <SelectItem value="5">Team of 5</SelectItem>
          <SelectItem value="6">Team of 6</SelectItem>
        </SelectContent>
      </Select>

      <Button
        size="sm"
        onClick={() => {
          onAdd({
            id: `temp-${Date.now()}`,
            difficulty,
            gender,
            teamSize,
            isSoldOut: false,
          })
        }}
      >
        Add
      </Button>
    </div>
  )
}

export default AddCategoryForm
