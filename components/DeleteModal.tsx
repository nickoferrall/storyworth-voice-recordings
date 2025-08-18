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
} from '../src/components/ui/alert-dialog'
import ErrorMessage from './Layout/ErrorMessage'
import { cn } from '../src/lib/utils'

type Props = {
  open: boolean
  handleDelete: (id: string) => void
  id: string
  title: string
  description: string
  onClose: () => void
  error?: string | null
  disabled?: boolean
}

const DeleteModal = ({
  open,
  id,
  onClose,
  title,
  description,
  handleDelete,
  error,
  disabled,
}: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && <ErrorMessage error={error} />}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(id)}
            className={cn(
              'bg-red-500 hover:bg-red-700',
              disabled && 'opacity-50 cursor-not-allowed hover:bg-red-500',
            )}
            disabled={disabled}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteModal
