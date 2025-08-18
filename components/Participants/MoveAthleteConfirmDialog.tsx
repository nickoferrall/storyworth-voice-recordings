import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../src/components/ui/alert-dialog'

interface MoveAthleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  athleteName: string
  currentTeamName: string
  targetTeamName: string
  onConfirm: () => void
}

const MoveAthleteConfirmDialog: React.FC<MoveAthleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  athleteName,
  currentTeamName,
  targetTeamName,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Team Move</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to move {athleteName} to a different team? This action
            will:
            <br />
            <br />• Remove them from their current team:{' '}
            <strong>{currentTeamName}</strong>
            <br />• Add them to: <strong>{targetTeamName}</strong>
            <br />
            • Update their heat assignments if applicable
            <br />
            <br />
            This action cannot be undone easily.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, Move Athlete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default MoveAthleteConfirmDialog
