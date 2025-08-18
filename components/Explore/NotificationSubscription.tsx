import React, { useState, useEffect } from 'react'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from '../../src/components/ui/dialog'
import { Bell, ArrowRight, Check, Settings, Loader2, ChevronsUpDown } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import {
 TooltipProvider,
 Tooltip,
 TooltipTrigger,
 TooltipContent,
} from '../../src/components/ui/tooltip'
import { cn } from '../../src/lib/utils'
import {
 useCreateNotificationSubscriptionMutation,
 useUpdateNotificationSubscriptionMutation,
 useGetNotificationSubscriptionQuery,
} from '../../src/generated/graphql'
import { Popover, PopoverContent, PopoverTrigger } from '../../src/components/ui/popover'
import {
 Command,
 CommandInput,
 CommandList,
 CommandEmpty,
 CommandGroup,
 CommandItem,
} from '../../src/components/ui/command'
import { Checkbox } from '../../src/components/ui/checkbox'
import { getCountriesByContinent } from '../../utils/getCountriesByContinent'

interface FilterValues {
 eventType: string
 gender: string
 teamSize: string
 difficulty: string
 countries: string[]
 locations: string[]
 tags: string[]
}

interface FilterOptions {
 eventTypes: string[]
 genders: ['ALL', 'MALE', 'FEMALE', 'MIXED']
 teamSizes: ['ALL', '1', '2', '3', '4']
 difficulties: ['ALL', 'ELITE', 'RX', 'INTERMEDIATE', 'EVERYDAY', 'MASTERS', 'TEEN']
 countries: string[]
 locations: string[]
 tags: string[]
}

interface NotificationSubscriptionProps {
 filterValues: FilterValues
 filterOptions: FilterOptions
}

const NotificationSubscription = ({
 filterValues,
 filterOptions,
}: NotificationSubscriptionProps) => {
 const [notificationEmail, setNotificationEmail] = useState('')
 const [isSubmitted, setIsSubmitted] = useState(false)
 const [showSuccess, setShowSuccess] = useState(false)
 const [showTooltip, setShowTooltip] = useState(false)
 const [isDialogOpen, setIsDialogOpen] = useState(false)
 const [isSaving, setIsSaving] = useState(false)
 const { user } = useUser()
 const [createNotification] = useCreateNotificationSubscriptionMutation()
 const [updateNotification] = useUpdateNotificationSubscriptionMutation()

 // Mirror FilterBar state
 const [notifyEventType, setNotifyEventType] = useState<string>(
  filterValues.eventType ?? 'ALL',
 )
 const [notifyGender, setNotifyGender] = useState<string>(filterValues.gender)
 const [notifyTeamSize, setNotifyTeamSize] = useState<string>(filterValues.teamSize)
 const [notifyDifficulty, setNotifyDifficulty] = useState<string>(
  filterValues.difficulty,
 )
 const [notifyCountries, setNotifyCountries] = useState<string[]>(filterValues.countries)
 const [notifyLocations, setNotifyLocations] = useState<string[]>(filterValues.locations)
 const [notifyTags, setNotifyTags] = useState<string[]>(filterValues.tags)
 const [openPopover, setOpenPopover] = useState<string | null>(null)

 const filters = [
  {
   key: 'eventType',
   label: 'Event Type',
   value: notifyEventType,
   options: [...filterOptions.eventTypes],
   onSelect: (value: string) => setNotifyEventType(value),
   formatLabel: (value: string) =>
    ({
     ALL: 'All Event Types',
     ...filterOptions.eventTypes.reduce(
      (acc, type) => ({ ...acc, [type]: type }),
      {},
     ),
    })[value] || 'Event Type',
   className: (value: string) =>
    cn(
     'w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
     value !== 'ALL' && value !== '' && 'text-muted-foreground',
    ),
  },
  {
   key: 'gender',
   label: 'Gender',
   value: notifyGender,
   options: filterOptions.genders,
   onSelect: (value: string) => setNotifyGender(value),
   formatLabel: (value: string) =>
    ({
     ALL: 'All Genders',
     MALE: 'Male',
     FEMALE: 'Female',
     MIXED: 'Mixed',
    })[value] || 'Gender',
   className: (value: string) =>
    cn(
     'w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
     !value && 'text-muted-foreground',
    ),
  },
  {
   key: 'teamSize',
   label: 'Team Size',
   value: notifyTeamSize,
   options: filterOptions.teamSizes,
   onSelect: (value: string) => setNotifyTeamSize(value),
   formatLabel: (value: string) =>
    ({
     ALL: 'All Team Sizes',
     '1': 'Individual',
     '2': 'Pairs',
     '3': 'Teams of 3',
     '4': 'Teams of 4',
    })[value] || 'Team Size',
   className: (value: string) =>
    cn(
     'w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
     !value && 'text-muted-foreground',
    ),
  },
  {
   key: 'difficulty',
   label: 'Difficulty',
   value: notifyDifficulty,
   options: filterOptions.difficulties,
   onSelect: (value: string) => setNotifyDifficulty(value),
   formatLabel: (value: string) =>
    ({
     ALL: 'All Difficulties',
     ELITE: 'Elite',
     RX: 'RX',
     INTERMEDIATE: 'Intermediate',
     EVERYDAY: 'Everyday/Scaled',
     MASTERS: 'Masters',
     TEEN: 'Teen',
    })[value] || 'Difficulty',
   className: (value: string) =>
    cn(
     'w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
     !value && 'text-muted-foreground',
    ),
  },
  {
   key: 'country',
   label: 'Countries',
   value: notifyCountries,
   options: ['Europe', 'North America', '---', ...filterOptions.countries],
   showSearch: true,
   onSelect: (value: string) => {
    if (value === '---') return

    if (['Europe', 'North America'].includes(value)) {
     const continentCountries = getCountriesByContinent(value).filter((country) =>
      filterOptions.countries.includes(country),
     )
     const allContinentCountriesSelected = continentCountries.every((country) =>
      notifyCountries.includes(country),
     )

     if (allContinentCountriesSelected) {
      setNotifyCountries((prev) =>
       prev.filter((country) => !continentCountries.includes(country)),
      )
     } else {
      setNotifyCountries((prev) => {
       const newCountries = new Set([...prev, ...continentCountries])
       return Array.from(newCountries)
      })
     }
    } else {
     setNotifyCountries((prev) => {
      const newCountries = new Set(prev)
      if (newCountries.has(value)) {
       newCountries.delete(value)
      } else {
       newCountries.add(value)
      }
      return Array.from(newCountries)
     })
    }
   },
   renderButton: (selectedCountries: string[]) => {
    if (selectedCountries.length === 0) return 'All Countries'
    return `${selectedCountries.length} ${
     selectedCountries.length === 1 ? 'country' : 'countries'
    }`
   },
   className: () =>
    cn(
     'w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
    ),
  },
  {
   key: 'location',
   label: 'Cities',
   value: notifyLocations,
   options: filterOptions.locations,
   showSearch: true,
   onSelect: (value: string) => {
    setNotifyLocations((prev) => {
     const newLocations = new Set(prev)
     if (newLocations.has(value)) {
      newLocations.delete(value)
     } else {
      newLocations.add(value)
     }
     return Array.from(newLocations)
    })
   },
   renderButton: (selectedLocations: string[]) => {
    if (selectedLocations.length === 0) return 'All Cities'
    return `${selectedLocations.length} ${
     selectedLocations.length === 1 ? 'city' : 'cities'
    }`
   },
   className: () =>
    cn(
     'w-full justify-between border border-input text-foreground hover:bg-accent hover:text-accent-foreground',
    ),
  },
 ]

 const { data: subscriptionData, refetch } = useGetNotificationSubscriptionQuery({
  variables: { email: notificationEmail },
  skip: !notificationEmail,
 })

 useEffect(() => {
  // Check for stored email in localStorage
  const storedEmail = localStorage.getItem('notificationEmail')
  if (storedEmail) {
   setNotificationEmail(storedEmail)
   setIsSubmitted(true)
  }
 }, [])

 useEffect(() => {
  if (subscriptionData?.getNotificationSubscription) {
   const prefs = subscriptionData.getNotificationSubscription
   setNotifyEventType(prefs.eventType || filterValues.eventType)
   setNotifyGender(prefs.gender || filterValues.gender)
   setNotifyTeamSize(prefs.teamSize || filterValues.teamSize)
   setNotifyDifficulty(prefs.difficulty || filterValues.difficulty)
   setNotifyCountries(prefs.countries || filterValues.countries)
   setNotifyLocations(prefs.locations || filterValues.locations)
   setNotifyTags(prefs.tags || filterValues.tags)
  }
 }, [subscriptionData, filterValues])

 useEffect(() => {
  setNotifyEventType(filterValues.eventType)
  setNotifyGender(filterValues.gender)
  setNotifyTeamSize(filterValues.teamSize)
  setNotifyDifficulty(filterValues.difficulty)
  setNotifyCountries(filterValues.countries)
  setNotifyLocations(filterValues.locations)
  setNotifyTags(filterValues.tags)
 }, [filterValues])

 const handleSubmitEmail = async () => {
  try {
   const email = notificationEmail || user?.email
   if (!email) return

   await createNotification({
    variables: {
     input: {
      email,
      ...filterValues,
     },
    },
   })

   localStorage.setItem('notificationEmail', email)
   setShowSuccess(true)
   setTimeout(() => {
    setShowSuccess(false)
    setIsSubmitted(true)
   }, 1500)
  } catch (error) {
   console.error('Failed to create notification subscription:', error)
  }
 }

 const handleSavePreferences = async () => {
  try {
   setIsSaving(true)
   await updateNotification({
    variables: {
     input: {
      email: notificationEmail,
      eventType: notifyEventType,
      gender: notifyGender,
      teamSize: notifyTeamSize,
      difficulty: notifyDifficulty,
      countries: notifyCountries,
      locations: notifyLocations,
      tags: notifyTags,
     },
    },
   })
   await refetch()
   setIsDialogOpen(false)
  } catch (error) {
   console.error('Failed to update notification preferences:', error)
  } finally {
   setIsSaving(false)
  }
 }

 return (
  <>
   {!isSubmitted ? (
    <TooltipProvider>
     <Tooltip open={showTooltip}>
      <TooltipTrigger asChild>
       <div className="relative w-full sm:w-[260px]">
        <Bell className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
         type="email"
         placeholder="Enter your email"
         className={cn(
          'pl-10 pr-10 transition-all duration-200',
          showSuccess && 'pr-16 border-green-500',
         )}
         defaultValue={user?.email || ''}
         onChange={(e) => setNotificationEmail(e.target.value)}
         onFocus={() => setShowTooltip(true)}
         onBlur={() => setShowTooltip(false)}
         autoFocus
         onKeyDown={(e) => {
          if (e.key === 'Enter') {
           handleSubmitEmail()
          }
         }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
         {showSuccess ? (
          <Check className="h-4 w-4 text-green-500" />
         ) : (
          <ArrowRight
           className="h-4 w-4 hover: cursor-pointer"
           onClick={handleSubmitEmail}
          />
         )}
        </div>
       </div>
      </TooltipTrigger>
      <TooltipContent>
       <p>Get notified when new events match your filters</p>
      </TooltipContent>
     </Tooltip>
    </TooltipProvider>
   ) : (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
     <DialogTrigger asChild>
      <Button variant="outline" className="gap-2">
       <Bell className="h-4 w-4" />
       Notifications
       <Settings className="h-4 w-4" />
      </Button>
     </DialogTrigger>
     <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
       <DialogTitle>Notification Preferences</DialogTitle>
       <DialogDescription>
        Update your notification preferences for {notificationEmail}
       </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
       {filters.map((filter) => (
        <Popover
         key={filter.key}
         open={openPopover === filter.key}
         onOpenChange={(open) => setOpenPopover(open ? filter.key : null)}
        >
         <PopoverTrigger asChild>
          <Button variant="outline" className={filter.className(filter.value)}>
           <span className="truncate">
            {filter.renderButton
             ? filter.renderButton(filter.value)
             : filter.formatLabel
              ? filter.formatLabel(filter.value)
              : filter.value || filter.label}
           </span>
           <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
         </PopoverTrigger>
         <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
           {filter.showSearch && (
            <CommandInput
             placeholder={`Search ${filter.label.toLowerCase()}...`}
             className="border-none outline-none focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0"
            />
           )}
           <CommandList>
            <CommandEmpty>
             No {filter.label.toLowerCase()} found.
            </CommandEmpty>
            <CommandGroup>
             {filter.options.map((option) => (
              <CommandItem
               key={option}
               onSelect={() => {
                if (filter.onSelect) {
                 filter.onSelect(option)
                }
               }}
               className={cn(
                'text-foreground',
                option === '---' && 'border-t border-border py-2 my-1',
               )}
               disabled={option === '---'}
              >
               {(filter.key === 'country' ||
                filter.key === 'location') && (
                <Checkbox
                 checked={
                  filter.key === 'country'
                   ? notifyCountries.includes(option)
                   : notifyLocations.includes(option)
                 }
                 className="mr-2"
                />
               )}
               {filter.formatLabel ? filter.formatLabel(option) : option}
              </CommandItem>
             ))}
            </CommandGroup>
           </CommandList>
          </Command>
         </PopoverContent>
        </Popover>
       ))}
      </div>
      <Button
       onClick={handleSavePreferences}
       disabled={isSaving}
       variant="outline"
       className="w-full mt-4"
      >
       {isSaving ? (
        <span className="flex items-center gap-2">
         <Loader2 className="h-4 w-4 animate-spin" />
         Saving...
        </span>
       ) : (
        'Save Preferences'
       )}
      </Button>
     </DialogContent>
    </Dialog>
   )}
  </>
 )
}

export default NotificationSubscription
