import React, { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { Textarea } from '../../src/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select'
import { currencySymbols } from '../../utils/constants'
import {
  Currency,
  GetScoreSettingByCompetitionIdDocument,
  TicketType,
  useCreateTicketTypeMutation,
  useDeleteTicketTypeMutation,
  useUpdateTicketTypeMutation,
} from '../../src/generated/graphql'
import EntryInputs from './CustomHeats'
import { Selectable } from 'kysely'
import useCompetitionId from '../../hooks/useCompetitionId'
import ErrorMessage from '../Layout/ErrorMessage'
import { GetHeatsByCompetitionIdDocument } from '../../src/generated/graphql'
import { RadioGroup, RadioGroupItem } from '../../src/components/ui/radio-group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import DeleteModal from '../DeleteModal'
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

export type TicketTypeForm = {
  id: string
  name: string
  description: string
  currency: Currency
  price: number
  teamSize: number
  maxEntries: number
  offerEarlyBird: boolean
  isVolunteer: boolean
  allowHeatSelection: boolean
  earlyBird: {
    startDateTime: string
    endDateTime: string
    price: number
    limit: number
  }
}

const defaultFormData = {
  id: '',
  name: '',
  description: '',
  currency: Currency.Gbp,
  price: 100,
  teamSize: 1,
  maxEntries: 50,
  offerEarlyBird: false,
  isVolunteer: false,
  allowHeatSelection: false,
  earlyBird: {
    startDateTime: '',
    endDateTime: '',
    price: 75,
    limit: 10,
  },
} as const

type Props = {
  open: boolean
  onClose: () => void
  refetch: () => void
  ticketType?: Selectable<TicketType>
}

const TicketTypeModal = ({ open, onClose, refetch, ticketType }: Props) => {
  const [formData, setFormData] = useState<TicketTypeForm>(defaultFormData)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const competitionId = useCompetitionId()
  const [deleteTicket, { error: deleteError }] = useDeleteTicketTypeMutation()
  const [createTicketType, { loading: creating, error: createError }] =
    useCreateTicketTypeMutation()
  const [updateTicketType, { loading: updating, error: updateError }] =
    useUpdateTicketTypeMutation()
  const isEditMode = Boolean(ticketType)
  const loading = creating || updating
  const error = createError?.message || updateError?.message
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
  const [showTeamSizeWarning, setShowTeamSizeWarning] = useState(false)
  const teamSizeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ticketType) {
      setFormData({
        ...ticketType,
        description: ticketType.description ?? '',
        earlyBird: {
          startDateTime: ticketType.earlyBird?.startDateTime || '',
          endDateTime: ticketType.earlyBird?.endDateTime || '',
          price: ticketType.earlyBird?.price ?? 0,
          limit: ticketType.earlyBird?.limit || 0,
        },
      })
    }
  }, [ticketType])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setHasUnsavedChanges(true)
    const { name, value } = e.target
    if (['price', 'teamSize', 'maxEntries'].includes(name)) {
      setFormData({ ...formData, [name]: parseFloat(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const closeAndReset = () => {
    onClose()
    setFormData(defaultFormData)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return

    if (formData.name.toLowerCase().includes('pairs') && formData.teamSize === 1) {
      setShowTeamSizeWarning(true)
      return
    }

    await submitForm()
  }

  const submitForm = async () => {
    const variables = {
      input: {
        id: formData.id,
        name: formData.name,
        description: formData.description,
        maxEntries: formData.maxEntries,
        teamSize: formData.teamSize,
        price: formData.price,
        isVolunteer: formData.isVolunteer,
        currency: formData.currency,
        competitionId: competitionId,
        allowHeatSelection: formData.allowHeatSelection,
        earlyBird: formData.offerEarlyBird
          ? {
              ...formData.earlyBird,
              ticketTypeId: formData.id,
            }
          : null,
      },
    }

    try {
      if (isEditMode) {
        await updateTicketType({
          variables,
          refetchQueries: [
            {
              query: GetHeatsByCompetitionIdDocument,
              variables: { competitionId },
            },
          ],
        })
      } else {
        await createTicketType({
          variables,
          refetchQueries: [
            {
              query: GetHeatsByCompetitionIdDocument,
              variables: { competitionId },
            },
            {
              query: GetScoreSettingByCompetitionIdDocument,
              variables: { competitionId },
            },
          ],
        })
      }
      setHasUnsavedChanges(false)
      refetch()
      closeAndReset()
    } catch (error) {
      console.error('Error submitting ticket type:', error)
    }
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true)
      return
    }
    onClose()
    setFormData(defaultFormData)
  }

  const handleConfirmClose = () => {
    setHasUnsavedChanges(false)
    setShowUnsavedChangesDialog(false)
    onClose()
    setFormData(defaultFormData)
  }

  const toggleVolunteer = () => {
    setHasUnsavedChanges(true)
    setFormData({
      ...formData,
      isVolunteer: !formData.isVolunteer,
      teamSize: !formData.isVolunteer ? 1 : formData.teamSize,
      price: !formData.isVolunteer ? 0 : formData.price,
      allowHeatSelection: !formData.isVolunteer ? false : formData.allowHeatSelection,
      offerEarlyBird: !formData.isVolunteer ? false : formData.offerEarlyBird,
    })
  }

  const toggleAllowHeatSelection = () => {
    setHasUnsavedChanges(true)
    setFormData({ ...formData, allowHeatSelection: !formData.allowHeatSelection })
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTicket({ variables: { id } })
      refetch()
      setIsDeleteModalOpen(false)
      handleClose()
    } catch (error) {
      console.error('Error deleting ticket type:', error)
    }
  }

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true)
  }

  const handleClickSecondary = () => {
    if (isEditMode && ticketType?.registered === 0) {
      handleOpenDeleteModal()
    } else {
      handleClose()
    }
  }

  const handleTeamSizeWarningClose = () => {
    setShowTeamSizeWarning(false)
    setTimeout(() => {
      teamSizeInputRef.current?.focus()
    }, 0)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Ticket Type' : 'Create Ticket Type'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for this ticket type.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ticket Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Mixed RX Pairs"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description ?? ''}
                onChange={handleChange}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label>Is Volunteer Ticket Type?</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Is this ticket only applicable to volunteers? E.g. Judges
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <RadioGroup
                value={formData.isVolunteer ? 'yes' : 'no'}
                onValueChange={(value) => toggleVolunteer()}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="volunteer-yes" />
                  <Label htmlFor="volunteer-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="volunteer-no" />
                  <Label htmlFor="volunteer-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Label>Let athletes choose their heat?</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      When registering, can athletes select their heat time? If yes, you
                      can update the times of the heats in the Workouts section.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <RadioGroup
                value={formData.allowHeatSelection ? 'yes' : 'no'}
                onValueChange={(value) => {
                  setHasUnsavedChanges(true)
                  setFormData({ ...formData, allowHeatSelection: value === 'yes' })
                }}
                disabled={formData.isVolunteer}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="heat-yes" />
                  <Label htmlFor="heat-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="heat-no" />
                  <Label htmlFor="heat-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <EntryInputs
              handleChange={handleChange}
              formData={formData}
              setFormData={setFormData}
              teamSizeInputRef={teamSizeInputRef}
            />

            <div className="flex gap-4">
              <div className="w-1/4">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  name="currency"
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleChange({
                      target: { name: 'currency', value },
                    } as any)
                  }
                  disabled={formData.isVolunteer}
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue
                      placeholder="Select currency"
                      className="text-gray-900"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900">
                    <SelectItem
                      value="USD"
                      className="text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {currencySymbols.USD}
                    </SelectItem>
                    <SelectItem
                      value="EUR"
                      className="text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {currencySymbols.EUR}
                    </SelectItem>
                    <SelectItem
                      value="GBP"
                      className="text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {currencySymbols.GBP}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="price">Ticket Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  disabled={formData.isVolunteer}
                />
              </div>
            </div>

            {error && <ErrorMessage error={error} />}

            <DialogFooter className="flex justify-between w-full">
              <Button
                type="button"
                variant={
                  isEditMode && ticketType?.registered === 0 ? 'destructive' : 'secondary'
                }
                onClick={handleClickSecondary}
              >
                {isEditMode && ticketType?.registered === 0 ? 'Delete' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={loading}>
                {isEditMode ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        handleDelete={handleDelete}
        id={formData.id}
        title={`Delete ${formData.name}`}
        description="Are you sure you want to delete this ticket type?"
        error={deleteError?.message}
      />

      <AlertDialog
        open={showUnsavedChangesDialog}
        onOpenChange={setShowUnsavedChangesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? Your changes will
              be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showTeamSizeWarning} onOpenChange={handleTeamSizeWarningClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Team Size</AlertDialogTitle>
            <AlertDialogDescription>
              This ticket type includes "Pairs" in the name but has a team size of 1. Are
              you sure this is correct?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleTeamSizeWarningClose}>
              Review Team Size
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowTeamSizeWarning(false)
                submitForm()
              }}
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default TicketTypeModal
