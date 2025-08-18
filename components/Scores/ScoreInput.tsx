import React, { useState } from 'react'
import { Input } from '../../src/components/ui/input'
import { Checkbox } from '../../src/components/ui/checkbox'

interface ScoreInputProps {
  scoreId: string
  currentScore: string
  isCompleted: boolean
  isCompletionBased: boolean
  unitLabel: string
  placeholder: string
  onSave: (score: string, isCompleted: boolean) => void
  onCancel: () => void
  onCompletionChange: (isCompleted: boolean) => void
}

const ScoreInput: React.FC<ScoreInputProps> = ({
  scoreId,
  currentScore,
  isCompleted,
  isCompletionBased,
  unitLabel,
  placeholder,
  onSave,
  onCancel,
  onCompletionChange,
}) => {
  const [scoreValue, setScoreValue] = useState(currentScore)
  const [completionStatus, setCompletionStatus] = useState(isCompleted)
  const [isInteractingWithCheckbox, setIsInteractingWithCheckbox] = useState(false)

  const handleSave = () => {
    onSave(scoreValue, completionStatus)
  }

  const handleCompletionToggle = () => {
    const newStatus = !completionStatus
    setCompletionStatus(newStatus)
    onCompletionChange(newStatus)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleBlur = () => {
    if (isInteractingWithCheckbox) {
      setIsInteractingWithCheckbox(false)
      return
    }
    handleSave()
  }

  return (
    <div className="flex flex-col items-center space-y-2 p-2 bg-gray-50 rounded-lg">
      <Input
        value={scoreValue}
        onChange={(e) => setScoreValue(e.target.value)}
        placeholder={placeholder}
        className="w-24 text-center"
        autoFocus
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />

      {isCompletionBased && (
        <div
          className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:bg-gray-100"
          onMouseDown={(e) => {
            setIsInteractingWithCheckbox(true)
            e.preventDefault() // Prevent input from losing focus
          }}
          onClick={(e) => {
            e.stopPropagation()
            handleCompletionToggle()
            // Reset the flag after a brief delay
            setTimeout(() => setIsInteractingWithCheckbox(false), 100)
          }}
        >
          <Checkbox
            id={`completed-${scoreId}`}
            checked={completionStatus}
            onCheckedChange={handleCompletionToggle}
            className="bg-transparent"
          />
          <span className="text-xs bg-transparent select-none">Completed</span>
        </div>
      )}
    </div>
  )
}

export default ScoreInput
