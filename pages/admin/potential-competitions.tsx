import React, { useState, useMemo } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import withAuth from '../../utils/withAuth'
import {
  useGetPotentialCompetitionsQuery,
  useApprovePotentialCompetitionsMutation,
  useRejectPotentialCompetitionsMutation,
} from '../../src/generated/graphql'
import { currencySymbols } from '../../utils/currencyMap'

type PotentialCompetitionStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// Helper function to calculate price range from potential ticket types
const calculatePriceRange = (
  potentialTicketTypes: any[] | null | undefined,
  fallbackPrice: number | null | undefined,
  currency?: string | null,
) => {
  // First try to use ticket types
  if (potentialTicketTypes && potentialTicketTypes.length > 0) {
    // Filter out volunteer tickets (but include free tickets with price: 0)
    const nonVolunteerTickets = potentialTicketTypes.filter(
      (tt) => tt && !tt.isVolunteer && tt.price !== null && tt.price !== undefined,
    )

    if (nonVolunteerTickets.length > 0) {
      const prices = nonVolunteerTickets.map((tt) => tt.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      // Use the currency from ticket types or fallback
      const displayCurrency = nonVolunteerTickets[0]?.currency || currency || 'USD'
      const symbol =
        currencySymbols[displayCurrency as keyof typeof currencySymbols] ||
        displayCurrency

      // Handle free competitions
      if (minPrice === 0 && maxPrice === 0) {
        return 'FREE'
      } else if (minPrice === 0) {
        return `FREE - ${symbol}${maxPrice}`
      } else if (minPrice === maxPrice) {
        return `${symbol}${minPrice}`
      } else {
        return `${symbol}${minPrice} - ${symbol}${maxPrice}`
      }
    }
  }

  // Fallback to single competition price
  if (fallbackPrice !== null && fallbackPrice !== undefined && currency) {
    if (fallbackPrice === 0) {
      return 'FREE'
    } else if (fallbackPrice > 0) {
      const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency
      return `${symbol}${fallbackPrice}`
    }
  }

  return 'View Pricing'
}

import {
  CheckSquare,
  Square,
  Edit,
  Check,
  X,
  Calendar,
  MapPin,
  Globe,
} from 'lucide-react'
import { formatEventDate } from '../../utils/formatEventDate'
import EditPotentialCompModal from '../../components/Admin/EditPotentialCompModal'

interface AdminPotentialCompetitionsProps {
  user: any
}

export default function AdminPotentialCompetitions({
  user,
}: AdminPotentialCompetitionsProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingComp, setEditingComp] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<PotentialCompetitionStatus | 'ALL'>(
    'PENDING',
  )

  // Queries and mutations
  const { data, loading, error, refetch } = useGetPotentialCompetitionsQuery()
  const [approveMutation, { loading: approving }] =
    useApprovePotentialCompetitionsMutation()
  const [rejectMutation, { loading: rejecting }] =
    useRejectPotentialCompetitionsMutation()

  // Filter competitions by status
  const filteredComps = useMemo(() => {
    if (!data?.getPotentialCompetitions) return []
    return data.getPotentialCompetitions.filter(
      (comp) => filterStatus === 'ALL' || comp.status === filterStatus,
    )
  }, [data, filterStatus])

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredComps.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredComps.map((comp) => comp.id))
    }
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    )
  }

  // Action handlers
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return

    try {
      await approveMutation({
        variables: { potentialCompetitionIds: selectedIds },
      })
      setSelectedIds([])
      refetch()
      alert(`✅ Approved ${selectedIds.length} competitions`)
    } catch (error) {
      alert(`❌ Error approving competitions: ${error}`)
    }
  }

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return

    try {
      await rejectMutation({
        variables: { potentialCompetitionIds: selectedIds },
      })
      setSelectedIds([])
      refetch()
      alert(`✅ Rejected ${selectedIds.length} competitions`)
    } catch (error) {
      alert(`❌ Error rejecting competitions: ${error}`)
    }
  }

  const handleIndividualApprove = async (id: string) => {
    try {
      await approveMutation({
        variables: { potentialCompetitionIds: [id] },
      })
      refetch()
      alert('✅ Competition approved')
    } catch (error) {
      alert(`❌ Error approving competition: ${error}`)
    }
  }

  const handleIndividualReject = async (id: string) => {
    try {
      await rejectMutation({
        variables: { potentialCompetitionIds: [id] },
      })
      refetch()
      alert('✅ Competition rejected')
    } catch (error) {
      alert(`❌ Error rejecting competition: ${error}`)
    }
  }

  if (!user?.isSuperUser) {
    return (
      <>
        <Head>
          <title>Access Denied - Fitlo</title>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        </Head>
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-400">Super user privileges required.</p>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading - Fitlo Admin</title>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        </Head>
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Loading potential competitions...</div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Fitlo Admin</title>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        </Head>
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-red-400">Error loading competitions: {error.message}</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Admin: Potential Competitions - Fitlo</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      <div className="">
        <div className="max-w-7xl mx-auto p-6 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Potential Competitions</h1>
            <p className="text-gray-400">Review and approve scraped competitions</p>
          </div>

          {/* Controls */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filter */}
              <div className="flex items-center gap-4">
                <label className="text-white">Filter:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-gray-700 text-white rounded px-3 py-2 border border-gray-600"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <span className="text-gray-400">{filteredComps.length} competitions</span>
              </div>

              {/* Bulk Actions */}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-white">{selectedIds.length} selected</span>
                  <button
                    onClick={handleBulkApprove}
                    disabled={approving}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {approving ? 'Approving...' : 'Approve Selected'}
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={rejecting}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {rejecting ? 'Rejecting...' : 'Reject Selected'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr className="hover:bg-gray-700">
                    <th className="p-4 text-left">
                      <button onClick={handleSelectAll} className="text-white">
                        {selectedIds.length === filteredComps.length &&
                        filteredComps.length > 0 ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-left text-white font-semibold">Logo</th>
                    <th className="p-4 text-left text-white font-semibold">
                      Competition
                    </th>
                    <th className="p-4 text-left text-white font-semibold">Date</th>
                    <th className="p-4 text-left text-white font-semibold">Location</th>
                    <th className="p-4 text-left text-white font-semibold">
                      Price Range
                    </th>
                    <th className="p-4 text-left text-white font-semibold">Source</th>
                    <th className="p-4 text-left text-white font-semibold">Status</th>
                    <th className="p-4 text-left text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComps.map((comp) => (
                    <tr
                      key={comp.id}
                      className="border-t border-gray-700 hover:bg-gray-600"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => handleSelectOne(comp.id)}
                          className="text-white"
                        >
                          {selectedIds.includes(comp.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        {comp.logo ? (
                          <img
                            src={comp.logo}
                            alt={comp.name}
                            className="w-12 h-12 object-cover rounded border border-gray-600"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Logo</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-white font-medium">{comp.name}</div>
                        {comp.description && (
                          <div className="text-gray-400 text-sm truncate max-w-xs">
                            {comp.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          {(() => {
                            try {
                              const sd = comp.scrapedData
                                ? JSON.parse(comp.scrapedData as any)
                                : null
                              if (
                                sd &&
                                (sd.dateTbc || /coming soon/i.test(sd.rawDateText || ''))
                              ) {
                                return 'Date TBC'
                              }
                            } catch {}
                            return formatEventDate(comp.startDateTime as any)
                          })()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-4 h-4 text-white" />
                          <div className="text-white">
                            {comp.address?.city && comp.country
                              ? `${comp.address.city}, ${comp.country}`
                              : comp.country || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300 font-medium">
                          {calculatePriceRange(
                            comp.potentialTicketTypes,
                            comp.price,
                            comp.currency,
                          )}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300 text-sm">
                          {comp.source?.replace('SCRAPED_', '').replace('_', ' ')}
                        </div>
                        {comp.website && (
                          <a
                            href={comp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 mt-1"
                          >
                            <Globe className="w-3 h-3" />
                            View Original
                          </a>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            comp.status === 'PENDING'
                              ? 'bg-yellow-900 text-yellow-300'
                              : comp.status === 'APPROVED'
                                ? 'bg-green-900 text-green-300'
                                : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingComp(comp)}
                            className="text-blue-400 hover:text-blue-300 p-1"
                            title="Edit competition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {comp.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleIndividualApprove(comp.id)}
                                className="text-green-400 hover:text-green-300 p-1"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleIndividualReject(comp.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredComps.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No competitions found for selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingComp && (
          <EditPotentialCompModal
            competition={editingComp}
            onClose={() => setEditingComp(null)}
            onSave={() => {
              setEditingComp(null)
              refetch()
            }}
          />
        )}
      </div>
    </>
  )
}

export const getServerSideProps = withAuth(
  async (context: any) => {
    return {
      props: {},
    }
  },
  true, // require auth
  false, // no competition ownership check
)
