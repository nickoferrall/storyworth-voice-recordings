import React, { useState } from 'react'
import { X, Calendar, MapPin, Globe, Mail, DollarSign } from 'lucide-react'
import SnackbarComponent from '../Snackbar'

interface SuggestCompetitionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuggestCompetitionModal({
  isOpen,
  onClose,
}: SuggestCompetitionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    email: '',
    venue: '',
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    price: '',
    currency: 'USD',
    reason: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('Submitting competition suggestion:', formData)

      // Call the GraphQL mutation directly
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation SuggestNewCompetition(
              $name: String!
              $description: String
              $website: String
              $email: String
              $venue: String
              $city: String
              $country: String
              $startDate: String
              $endDate: String
              $price: Float
              $currency: String
              $reason: String
            ) {
              suggestNewCompetition(
                name: $name
                description: $description
                website: $website
                email: $email
                venue: $venue
                city: $city
                country: $country
                startDate: $startDate
                endDate: $endDate
                price: $price
                currency: $currency
                reason: $reason
              )
            }
          `,
          variables: {
            name: formData.name,
            description: formData.description || null,
            website: formData.website || null,
            email: formData.email || null,
            venue: formData.venue || null,
            city: formData.city || null,
            country: formData.country || null,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            price: formData.price ? parseFloat(formData.price) : null,
            currency: formData.currency || null,
            reason: formData.reason || null,
          },
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(
          result.errors[0]?.message || 'Failed to submit competition suggestion',
        )
      }

      const message =
        result.data?.suggestNewCompetition ||
        'Competition suggestion submitted successfully! We will review it shortly.'

      setSnackbar({
        open: true,
        message,
      })
      onClose()
      setFormData({
        name: '',
        description: '',
        website: '',
        email: '',
        venue: '',
        city: '',
        country: '',
        startDate: '',
        endDate: '',
        price: '',
        currency: 'USD',
        reason: '',
      })
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      setSnackbar({
        open: true,
        message: 'Failed to submit suggestion. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Suggest a Competition</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Know about a fitness competition that's not on Fitlo? Help us grow our
            community by suggesting it for review.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Competition Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competition Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g., CrossFit Regional Championship 2024"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="Brief description of the competition..."
              />
            </div>

            {/* Website and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="https://competition-website.com"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="organizer@competition.com"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Venue name"
                />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="City"
                />
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="Country"
                />
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Dates
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Entry Fee (optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  placeholder="0.00"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why should we add this competition?
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                placeholder="e.g., Popular local competition with many participants, well-organized annual event..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
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
          </form>
        </div>
      </div>

      {/* Snackbar for notifications */}
      <SnackbarComponent
        openSnackbar={snackbar.open}
        setOpenSnackbar={(open) => setSnackbar({ ...snackbar, open })}
        message={snackbar.message}
        autoHideDuration={4000}
      />
    </div>
  )
}
