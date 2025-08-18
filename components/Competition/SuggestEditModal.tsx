import React, { useState } from 'react'
// import { useSuggestCompetitionEditMutation } from '../../src/generated/graphql'
import { useDeleteCompetitionMutation } from '../../src/generated/graphql'
import { X, Trash2 } from 'lucide-react'
import DeleteModal from '../DeleteModal'
import SnackbarComponent from '../Snackbar'

interface Competition {
  id: string
  name: string
  description?: string | null
  website?: string | null
  email?: string | null
  startDateTime: string
  endDateTime?: string | null
  price?: number | null
  currency?: string | null
  address: {
    venue?: string | null
    city?: string | null
    country?: string | null
  }
}

interface User {
  id: string
  isSuperUser?: boolean
}

interface SuggestEditModalProps {
  competition: Competition
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export default function SuggestEditModal({
  competition,
  user,
  isOpen,
  onClose,
}: SuggestEditModalProps) {
  const [formData, setFormData] = useState({
    name: competition.name || '',
    description: competition.description || '',
    website: competition.website || '',
    email: competition.email || '',
    venue: competition.address.venue || '',
    city: competition.address.city || '',
    country: competition.address.country || '',
    price: competition.price?.toString() || '',
    currency: competition.currency || 'GBP',
    reason: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  // const [suggestEdit] = useSuggestCompetitionEditMutation()
  const [deleteCompetition] = useDeleteCompetitionMutation()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDelete = async (id: string) => {
    if (!user?.isSuperUser) return

    setIsDeleting(true)
    try {
      await deleteCompetition({
        variables: { id },
      })
      setSnackbar({ open: true, message: 'Competition deleted successfully!' })
      onClose()
      // Redirect or refresh the page
      setTimeout(() => {
        window.location.href = '/explore'
      }, 1000)
    } catch (error) {
      console.error('Error deleting competition:', error)
      setSnackbar({
        open: true,
        message: 'Failed to delete competition. Please try again.',
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // Only send fields that have actually changed
      const changes: any = { competitionId: competition.id }

      if (formData.name !== competition.name) changes.name = formData.name
      if (formData.description !== (competition.description || ''))
        changes.description = formData.description
      if (formData.website !== (competition.website || ''))
        changes.website = formData.website
      if (formData.email !== (competition.email || '')) changes.email = formData.email
      if (formData.venue !== (competition.address.venue || ''))
        changes.venue = formData.venue
      if (formData.city !== (competition.address.city || '')) changes.city = formData.city
      if (formData.country !== (competition.address.country || ''))
        changes.country = formData.country
      if (formData.price !== (competition.price?.toString() || ''))
        changes.price = formData.price ? parseFloat(formData.price) : null
      if (formData.currency !== (competition.currency || 'GBP'))
        changes.currency = formData.currency

      if (formData.reason.trim()) changes.reason = formData.reason.trim()

      // Check if any changes were made
      const hasChanges = Object.keys(changes).length > 1 // > 1 because competitionId is always included
      if (!hasChanges) {
        setSnackbar({
          open: true,
          message: 'Please make at least one change before submitting.',
        })
        return
      }

      // Submit the changes via GraphQL
      console.log('Submitting changes:', changes)

      // Call the GraphQL mutation directly
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation SuggestCompetitionEdit(
              $competitionId: String!
              $name: String
              $description: String
              $website: String
              $email: String
              $venue: String
              $city: String
              $country: String
              $price: Float
              $currency: String
              $reason: String
            ) {
              suggestCompetitionEdit(
                competitionId: $competitionId
                name: $name
                description: $description
                website: $website
                email: $email
                venue: $venue
                city: $city
                country: $country
                price: $price
                currency: $currency
                reason: $reason
              )
            }
          `,
          variables: changes,
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to submit changes')
      }

      const message =
        result.data?.suggestCompetitionEdit || 'Changes submitted successfully!'

      if (user?.isSuperUser) {
        setSnackbar({ open: true, message: 'Changes applied immediately!' })
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setSnackbar({ open: true, message })
      }

      onClose()

      /* 
      // TODO: Uncomment when GraphQL types are generated
      const result = await suggestEdit({
        variables: changes,
      })

      if (result.data?.suggestCompetitionEdit) {
        alert(result.data.suggestCompetitionEdit)
        onClose()
      }
      */
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      setSnackbar({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to submit suggestion. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Suggest Edit</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Help us keep this competition information accurate! Suggest changes below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Competition Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Competition Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Enter competition name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Enter competition description"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="https://example.com"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="contact@example.com"
              />
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Enter price (leave empty for free)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="GBP">GBP (£)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="SEK">SEK (kr)</option>
                  <option value="NOK">NOK (kr)</option>
                  <option value="DKK">DKK (kr)</option>
                </select>
              </div>
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Enter venue name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Enter country"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Changes <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Briefly explain why these changes are needed..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-4">
              {/* Delete button - only for super users */}
              <div>
                {user?.isSuperUser && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Competition
                  </button>
                )}
              </div>

              {/* Right side buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        id={competition.id}
        title="Delete Competition"
        description={`Are you sure you want to delete "${competition.name}"? This action cannot be undone and will remove the competition from the platform.`}
        handleDelete={handleDelete}
        disabled={isDeleting}
        error={null}
      />

      {/* Snackbar for notifications */}
      <SnackbarComponent
        openSnackbar={snackbar.open}
        setOpenSnackbar={(open) => setSnackbar({ ...snackbar, open })}
        message={snackbar.message}
        autoHideDuration={3000}
      />
    </div>
  )
}
