import { useEffect } from 'react'
import Papa from 'papaparse'
import UploadImageDropzone from '../Overview/UploadImageDropzone'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select'

export type CsvRow = {
  firstName: string
  lastName: string
  email: string
  ticketTypeId?: string
  validated: boolean
  error?: string
  [key: string]: any
}

export type ColumnMapping = {
  firstName?: string
  lastName?: string
  email?: string
  name?: string
}

type TicketType = {
  id: string
  name: string
  teamSize: number
  // ... other ticket type properties
}

type Props = {
  onUpload: (data: CsvRow[], headers: string[], mapping: ColumnMapping) => void
  getTicketTypes: () => Promise<any>
}

const CsvUploader = ({ onUpload, getTicketTypes }: Props) => {
  useEffect(() => {
    const fetchTicketTypes = async () => {
      await getTicketTypes()
    }

    fetchTicketTypes()
  }, [getTicketTypes])

  const handleFileUpload = async (files: File[]) => {
    const file = files[0]

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const headers = results.meta.fields || []
        const mapping: ColumnMapping = {}

        // Enhance mapping logic for varied header cases
        headers.forEach((header) => {
          const headerLower = header?.toLowerCase().trim()
          if (headerLower?.includes('first') && headerLower.includes('name')) {
            mapping.firstName = header
          } else if (headerLower?.includes('last') && headerLower.includes('name')) {
            mapping.lastName = header
          } else if (headerLower === 'name') {
            mapping.name = header
          } else if (headerLower?.includes('email')) {
            mapping.email = header
          }
        })

        const parsedData: CsvRow[] = results.data.map((row: any) => {
          let firstName = ''
          let lastName = ''

          if (mapping.name) {
            const nameParts = row[mapping.name]?.split(' ') || []
            firstName = nameParts[0] || ''
            lastName = nameParts.slice(1).join(' ') || ''
          } else {
            firstName = mapping.firstName ? row[mapping.firstName]?.trim() || '' : ''
            lastName = mapping.lastName ? row[mapping.lastName]?.trim() || '' : ''
          }

          const email = mapping.email ? row[mapping.email]?.trim() || '' : ''

          return {
            firstName,
            lastName,
            email,
            validated: !!email,
            error: !email ? 'Missing email' : '',
          }
        })

        onUpload(parsedData, headers, mapping)
      },
      skipEmptyLines: true,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select a ticket type and upload a CSV file with participant information.
          <br />
          Required columns: <strong>Name</strong> (or <strong>First Name</strong>/
          <strong>Last Name</strong>) and <strong>Email</strong>
        </p>

        {/* <Select
          value={selectedTicketType?.id || ''}
          onValueChange={(ticketId) => {
            const ticket = ticketTypesData?.getTicketTypesByCompetitionId?.find(
              (t: TicketType) => t.id === ticketId,
            )
            setSelectedTicketType(ticket || null)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent>
            {ticketTypesData?.getTicketTypesByCompetitionId?.map((ticket: TicketType) => (
              <SelectItem key={ticket.id} value={ticket.id}>
                {ticket.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>

      <UploadImageDropzone
        onDrop={handleFileUpload}
        onRemove={() => {}}
        type="csv"
        accept={{
          'text/csv': ['.csv'],
          'application/vnd.ms-excel': ['.csv'],
        }}
        description="Click to upload a CSV file"
        showUploadUI
      />
    </div>
  )
}

export default CsvUploader
