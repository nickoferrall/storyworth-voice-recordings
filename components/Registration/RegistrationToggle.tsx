import React from 'react'
import { Switch } from '../../src/components/ui/switch'
import { Label } from '../../src/components/ui/label'
import {
  useUpdateCompetitionMutation,
  useGetCompetitionByIdQuery,
} from '../../src/generated/graphql'
import { useRouter } from 'next/router'
import { toast } from '../../src/hooks/use-toast'

const RegistrationToggle = () => {
  const router = useRouter()
  const competitionId = router.query.id as string

  const { data, loading } = useGetCompetitionByIdQuery({
    variables: { id: competitionId },
    skip: !competitionId,
  })

  const [updateCompetition, { loading: updating }] = useUpdateCompetitionMutation({
    onCompleted: () => {
      toast({
        title: 'Registration settings updated',
        description: 'Registration availability has been updated successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error updating registration settings',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const competition = data?.getCompetitionById

  if (loading || !competition) {
    return null
  }

  const handleToggle = async (enabled: boolean) => {
    try {
      await updateCompetition({
        variables: {
          id: competitionId,
          registrationEnabled: enabled,
        },
        optimisticResponse: {
          updateCompetition: {
            ...competition,
            registrationEnabled: enabled,
          },
        },
      })
    } catch (error) {
      console.error('Error updating registration enabled:', error)
      // Error handling is in onError callback above
    }
  }

  // Use database value, default to true if not set
  const registrationEnabled = competition.registrationEnabled ?? true

  return (
    <div className="flex items-center justify-between pt-2 mb-6">
      <div className="flex flex-col space-y-1">
        <Label className="text-base font-medium text-white">Registration Status</Label>
        <p className="text-sm text-white">
          {registrationEnabled
            ? 'New registrations are currently open'
            : 'New registrations are currently closed'}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Label htmlFor="registration-toggle" className="text-sm font-medium text-white">
          {registrationEnabled ? 'Open' : 'Closed'}
        </Label>
        <div
          className="p-2 rounded-md hover:bg-muted/20 cursor-pointer"
          onClick={() => handleToggle(!registrationEnabled)}
          role="button"
          aria-label="Toggle registration status"
        >
          <Switch
            id="registration-toggle"
            checked={registrationEnabled}
            onCheckedChange={handleToggle}
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}

export default RegistrationToggle
