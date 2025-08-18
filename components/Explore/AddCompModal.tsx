import React, { useState, useEffect } from 'react'
import { Plus, PlusCircle, X } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Textarea } from '../../src/components/ui/textarea'
import { Badge } from '../../src/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
 DialogFooter,
} from '../../src/components/ui/dialog'
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '../../src/components/ui/select'
import {
 Command,
 CommandEmpty,
 CommandGroup,
 CommandInput,
 CommandItem,
 CommandList,
} from '../../src/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../../src/components/ui/popover'
import { Checkbox } from '../../src/components/ui/checkbox'
import UploadImageDropzone from '../Overview/UploadImageDropzone'
import {
 Accordion,
 AccordionItem,
 AccordionTrigger,
 AccordionContent,
} from '../../src/components/ui/accordion'
import { useUser } from '../../contexts/UserContext'
import axios from 'axios'
import { upperFirst } from '../../lib/upperFirst'
import AddCategoryForm from './AddCategoryForm'
import { useAddDirectoryCompMutation } from '../../src/generated/graphql'
import { useToast } from '../../src/hooks/use-toast'
import { Currency } from '../../src/generated/graphql'
import ErrorMessage from '../Layout/ErrorMessage'

type Category = {
 id: string
 difficulty: 'ELITE' | 'RX' | 'INTERMEDIATE' | 'EVERYDAY' | 'MASTERS' | 'TEEN'
 gender: 'MALE' | 'FEMALE' | 'MIXED'
 teamSize: 1 | 2 | 3 | 4 | 5 | 6
 isSoldOut: boolean
}

const AddCompModal = () => {
 const { user } = useUser()
 const { toast } = useToast()
 const [open, setOpen] = useState(false)
 const [formData, setFormData] = useState({
  title: '',
  description: '',
  logo: null as string | null,
  date: '',
  endDate: '',
  price: '',
  currency: 'GBP' as Currency,
  location: '',
  eventType: '',
  format: '',
  tags: [] as string[],
  country: '',
  organiserEmail: '',
  websiteUrl: '',
  categories: [] as Category[],
  image: null as File | null,
  imageUrl: null as string | null,
 })
 const [showCategoryForm, setShowCategoryForm] = useState(false)
 const [uploading, setUploading] = useState(false)
 const [uploadError, setUploadError] = useState<string | null>(null)
 const [addDirectoryComp] = useAddDirectoryCompMutation()
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [error, setError] = useState<string | null>(null)

 // Check for stored email on component mount
 useEffect(() => {
  const storedEmail = localStorage.getItem('notificationEmail') || user?.email
  if (storedEmail) {
   setFormData((prev) => ({
    ...prev,
    organiserEmail: storedEmail,
   }))
  }
 }, [user?.email])

 const eventTypes = ['CrossFit', 'HYROX', 'Functional Fitness']
 const formats = ['Individual', 'Team', 'Both']
 const tags = [
  'Prize Money',
  'Masters Division',
  'Oly Lifting',
  'Women Only',
  'Beginners Welcome',
  'Elite',
  'Scaled Division',
 ]

 const defaultFormData = {
  title: '',
  description: '',
  logo: null as string | null,
  date: '',
  endDate: '',
  price: '',
  currency: 'GBP' as Currency,
  location: '',
  eventType: '',
  format: '',
  tags: [] as string[],
  country: '',
  organiserEmail: '',
  websiteUrl: '',
  categories: [] as Category[],
  image: null as File | null,
  imageUrl: null as string | null,
 }

 const handleClose = () => {
  setOpen(false)
  setFormData(defaultFormData)
  setShowCategoryForm(false)
  setUploadError(null)
 }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null) // Clear any previous errors

  try {
   const startDate = new Date(formData.date)
   startDate.setHours(12, 0, 0, 0)

   const endDate = formData.endDate ? new Date(formData.endDate) : undefined
   if (endDate) {
    endDate.setHours(12, 0, 0, 0)
   }

   const response = await addDirectoryComp({
    variables: {
     input: {
      title: formData.title,
      description: formData.description,
      date: startDate.toISOString(),
      endDate: endDate?.toISOString(),
      price: formData.price.replace(/[^0-9.]/g, ''),
      currency: formData.currency,
      location: formData.location,
      country: formData.country,
      eventType: formData.eventType,
      format: formData.format,
      tags: formData.tags,
      organiserEmail: formData.organiserEmail,
      websiteUrl: formData.websiteUrl || undefined,
      logo: formData.logo || undefined,
      categories: formData.categories.map((cat) => ({
       difficulty: cat.difficulty,
       gender: cat.gender,
       teamSize: cat.teamSize,
       isSoldOut: false,
      })),
     },
    },
   })

   if (response.data?.addDirectoryComp) {
    localStorage.setItem('notificationEmail', formData.organiserEmail)

    toast({
     title: 'Success!',
     description: 'Your event has been submitted and will be reviewed shortly.',
     variant: 'default',
     duration: 5000,
    })

    // Only close and reset on success
    setOpen(false)
    setFormData(defaultFormData)
   }
  } catch (error: any) {
   console.error('Error submitting competition:', error)
   setError(error.message || 'Failed to submit competition. Please try again.')
  } finally {
   setIsSubmitting(false)
  }
 }

 const handleImageUpload = async (file: File) => {
  setUploading(true)
  setUploadError(null)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'fitova')

  try {
   const response = await axios.post(
    `https://api.cloudinary.com/v1_1/dkeppgndn/image/upload`,
    formData,
   )
   return response.data.secure_url
  } catch (error) {
   setUploadError('Error uploading image')
   console.error('Error uploading image to Cloudinary:', error)
   throw error
  } finally {
   setUploading(false)
  }
 }

 const handleAddCategory = (newCategory: Category) => {
  setFormData((prev) => ({
   ...prev,
   categories: [...prev.categories, newCategory],
  }))
  setShowCategoryForm(false)
 }

 const handleDeleteCategory = (categoryId: string) => {
  setFormData((prev) => ({
   ...prev,
   categories: prev.categories.filter((cat) => cat.id !== categoryId),
  }))
 }

 const handleImageDrop = async (acceptedFiles: File[]) => {
  try {
   const file = acceptedFiles[0]
   const cloudinaryUrl = await handleImageUpload(file)
   setFormData((prev) => ({
    ...prev,
    imageUrl: cloudinaryUrl,
   }))
  } catch (error) {
   console.error('Error handling image drop:', error)
   toast({
    title: 'Upload Failed',
    description: 'Failed to upload image. Please try again.',
    variant: 'destructive',
   })
  }
 }

 const handleImageRemove = () => {
  setFormData((prev) => ({
   ...prev,
   image: null,
   imageUrl: null,
  }))
 }

 return (
  <Dialog open={open} onOpenChange={setOpen}>
   <DialogTrigger asChild>
    <Button className="w-full mt-2 md:mt-0 sm:w-auto">
     <Plus className="h-4 w-4 mr-2" />
     Add Event
    </Button>
   </DialogTrigger>
   <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
    <DialogHeader>
     <div className="flex justify-center p-4 bg-gray-50">
      <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
       {formData.logo ? (
        <Avatar className="w-full h-full">
         <AvatarImage src={formData.logo} alt="Event logo" />
         <AvatarFallback className="text-3xl">
          {formData.title.substring(0, 2).toUpperCase()}
         </AvatarFallback>
        </Avatar>
       ) : (
        <UploadImageDropzone
         onDrop={async (acceptedFiles) => {
          try {
           const file = acceptedFiles[0]
           const cloudinaryUrl = await handleImageUpload(file)
           setFormData((prev) => ({
            ...prev,
            logo: cloudinaryUrl,
           }))
          } catch (error) {
           console.error('Error handling logo upload:', error)
           toast({
            title: 'Upload Failed',
            description: 'Failed to upload logo. Please try again.',
            variant: 'destructive',
           })
          }
         }}
         onRemove={() => {
          setFormData((prev) => ({
           ...prev,
           logo: null,
          }))
         }}
         type="images"
         description={uploading ? 'Uploading...' : 'Click to add logo'}
        />
       )}
      </div>
     </div>
     <DialogTitle>Add Competition</DialogTitle>
     <DialogDescription>
      Share a competition to help the community find the event
     </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-4 py-4">
     {error && (
      <ErrorMessage
       error={error}
       className="mx-auto" // Center the error message
      />
     )}

     {/* Basic Info */}
     <div className="space-y-4">
      <div className="space-y-2">
       <label className="text-sm font-medium">Organiser Email</label>
       <Input
        type="email"
        value={formData.organiserEmail}
        onChange={(e) =>
         setFormData({ ...formData, organiserEmail: e.target.value })
        }
        placeholder="your@email.com"
        required
       />
      </div>

      <div className="space-y-2">
       <label className="text-sm font-medium">Event Name</label>
       <Input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="e.g., CrossFit Throwdown"
        required
       />
      </div>

      <div className="space-y-2">
       <label className="text-sm font-medium">Description (optional)</label>
       <Textarea
        value={formData.description}
        onChange={(e) =>
         setFormData({ ...formData, description: e.target.value })
        }
        placeholder="Describe the event and include any helpful links..."
       />
      </div>
     </div>

     {/* Additional Info Accordion */}
     <Accordion type="single" collapsible defaultValue="additional-info">
      <AccordionItem value="additional-info">
       <AccordionTrigger>Additional Information</AccordionTrigger>
       <AccordionContent>
        <div className="space-y-4 pt-4">
         {/* Categories Section */}
         <div className="space-y-2">
          <label className="text-sm font-medium">Categories</label>
          <div className="flex flex-wrap gap-2">
           {formData.categories.map((category, i) => (
            <div key={i} className="relative group">
             <Badge variant="secondary" className="text-sm px-3 py-1">
              {`${category.difficulty === 'RX' ? 'RX' : upperFirst(category.difficulty.toLowerCase())} ${upperFirst(category.gender.toLowerCase())} ${category.teamSize === 1 ? 'Individual' : category.teamSize === 2 ? 'Pairs' : `Team of ${category.teamSize}`}`}
              <button
               type="button"
               onClick={() => handleDeleteCategory(category.id)}
               className="ml-2 inline-flex items-center hover:text-red-500"
              >
               <X className="h-3 w-3" />
              </button>
             </Badge>
            </div>
           ))}
           {showCategoryForm ? (
            <AddCategoryForm onAdd={handleAddCategory} />
           ) : (
            <button
             type="button"
             onClick={() => setShowCategoryForm(true)}
             className="flex items-center gap-1 text-sm hover:"
            >
             <PlusCircle className="h-4 w-4" />
             Add Category
            </button>
           )}
          </div>
         </div>

         <div className="space-y-2">
          {formData.imageUrl ? (
           <div className="relative">
            <img
             src={formData.imageUrl}
             alt="Event"
             className="w-full h-48 object-cover rounded-md"
            />
            <Button
             type="button"
             variant="destructive"
             size="sm"
             className="absolute top-2 right-2"
             onClick={() => handleImageRemove()}
            >
             <X className="h-4 w-4" />
            </Button>
           </div>
          ) : (
           <UploadImageDropzone
            onDrop={handleImageDrop}
            onRemove={handleImageRemove}
            type="images"
            description={
             uploading ? 'Uploading...' : 'Click to add event image'
            }
           />
          )}
         </div>

         {/* Event Details */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
           <label className="text-sm font-medium">Event Type</label>
           <Select
            value={formData.eventType}
            onValueChange={(value) =>
             setFormData({ ...formData, eventType: value })
            }
           >
            <SelectTrigger>
             <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
             {eventTypes.map((type) => (
              <SelectItem key={type} value={type}>
               {type}
              </SelectItem>
             ))}
            </SelectContent>
           </Select>
          </div>
          <div className="space-y-2">
           <label className="text-sm font-medium">Format</label>
           <Select
            value={formData.format}
            onValueChange={(value) =>
             setFormData({ ...formData, format: value })
            }
           >
            <SelectTrigger>
             <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
             {formats.map((format) => (
              <SelectItem key={format} value={format}>
               {format}
              </SelectItem>
             ))}
            </SelectContent>
           </Select>
          </div>
         </div>

         {/* Date and Price */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
           <label className="text-sm font-medium">Start Date</label>
           <Input
            type="date"
            value={formData.date}
            onChange={(e) =>
             setFormData({ ...formData, date: e.target.value })
            }
            required
           />
          </div>
          <div className="space-y-2">
           <label className="text-sm font-medium">End Date (Optional)</label>
           <Input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
             setFormData({ ...formData, endDate: e.target.value })
            }
           />
          </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
           <label className="text-sm font-medium">Price</label>
           <Input
            value={formData.price}
            onChange={(e) => {
             // Remove any non-numeric characters except decimal point
             const cleanedValue = e.target.value.replace(/[^0-9.]/g, '')
             setFormData({ ...formData, price: cleanedValue })
            }}
            placeholder="e.g., 100"
            required
           />
          </div>
          <div className="space-y-2">
           <label className="text-sm font-medium">Currency</label>
           <Select
            value={formData.currency}
            onValueChange={(value) =>
             setFormData({ ...formData, currency: value as Currency })
            }
            required
           >
            <SelectTrigger>
             <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
             {[
              { code: 'USD', label: 'USD - US Dollar' },
              { code: 'EUR', label: 'EUR - Euro' },
              { code: 'GBP', label: 'GBP - British Pound' },
              { code: 'JPY', label: 'JPY - Japanese Yen' },
              { code: 'AUD', label: 'AUD - Australian Dollar' },
              { code: 'SR', label: 'SR - Saudi Riyal' },
              { code: 'CAD', label: 'CAD - Canadian Dollar' },
              { code: 'CHF', label: 'CHF - Swiss Franc' },
              { code: 'CNY', label: 'CNY - Chinese Yuan' },
              { code: 'DKK', label: 'DKK - Danish Krone' },
              { code: 'HKD', label: 'HKD - Hong Kong Dollar' },
              { code: 'NOK', label: 'NOK - Norwegian Krone' },
              { code: 'NZD', label: 'NZD - New Zealand Dollar' },
              { code: 'SEK', label: 'SEK - Swedish Krona' },
              { code: 'SGD', label: 'SGD - Singapore Dollar' },
              { code: 'ZAR', label: 'ZAR - South African Rand' },
              { code: 'AED', label: 'AED - UAE Dirham' },
              { code: 'BRL', label: 'BRL - Brazilian Real' },
              { code: 'INR', label: 'INR - Indian Rupee' },
              { code: 'MXN', label: 'MXN - Mexican Peso' },
              { code: 'THB', label: 'THB - Thai Baht' },
             ].map(({ code, label }) => (
              <SelectItem key={code} value={code}>
               {label}
              </SelectItem>
             ))}
            </SelectContent>
           </Select>
          </div>
         </div>

         {/* Location */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
           <label className="text-sm font-medium">Country</label>
           <Input
            type="text"
            value={formData.country}
            onChange={(e) =>
             setFormData({ ...formData, country: e.target.value })
            }
            placeholder="Enter country"
            required
           />
          </div>
          <div className="space-y-2">
           <label className="text-sm font-medium">City</label>
           <Input
            type="text"
            value={formData.location}
            onChange={(e) =>
             setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Enter city"
            required
           />
          </div>
         </div>

         {/* Tags */}
         <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <Popover>
           <PopoverTrigger asChild>
            <Button
             variant="outline"
             className="w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground"
            >
             Tags
             <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {formData.tags.length}
             </span>
            </Button>
           </PopoverTrigger>
           <PopoverContent className="w-[200px] p-0">
            <Command>
             <CommandInput
              placeholder="Search tags..."
              className="border-none outline-none focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0"
             />
             <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
               {tags.map((tag) => (
                <CommandItem
                 key={tag}
                 onSelect={() => {
                  setFormData((prev) => ({
                   ...prev,
                   tags: prev.tags.includes(tag)
                    ? prev.tags.filter((t) => t !== tag)
                    : [...prev.tags, tag],
                  }))
                 }}
                 className="text-foreground"
                >
                 <Checkbox
                  checked={formData.tags.includes(tag)}
                  className="mr-2"
                 />
                 {tag}
                </CommandItem>
               ))}
              </CommandGroup>
             </CommandList>
            </Command>
           </PopoverContent>
          </Popover>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
           <label className="text-sm font-medium">
            Website URL (Optional)
           </label>
           <Input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) =>
             setFormData({ ...formData, websiteUrl: e.target.value })
            }
            placeholder="https://..."
           />
          </div>
         </div>
        </div>
       </AccordionContent>
      </AccordionItem>
     </Accordion>

     <DialogFooter className="pt-2 sticky bottom-0 bg-background">
      <Button type="submit" disabled={isSubmitting}>
       {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
     </DialogFooter>
    </form>
   </DialogContent>
  </Dialog>
 )
}

export default AddCompModal
