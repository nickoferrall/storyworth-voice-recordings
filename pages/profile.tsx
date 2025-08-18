import React, { useState, useEffect } from 'react'
import { useUser } from '../contexts/UserContext'
import {
 useUploadUserAvatarMutation,
 useUpdateUserBioMutation,
 useUpdateUserMutation,
} from '../src/generated/graphql'
import { Avatar, AvatarFallback, AvatarImage } from '../src/components/ui/avatar'
import { Button } from '../src/components/ui/button'
import { Label } from '../src/components/ui/label'
import ErrorMessage from '../components/Layout/ErrorMessage'
import { Pencil } from 'lucide-react'

const Profile = () => {
 const { user, setUser } = useUser()
 const [profileImage, setProfileImage] = useState<File | null>(null)
 const [previewUrl, setPreviewUrl] = useState<string>('')
 const [bio, setBio] = useState(user?.bio || '')
 const [firstName, setFirstName] = useState(user?.firstName || '')
 const [lastName, setLastName] = useState(user?.lastName || '')
 const [isEditingBio, setIsEditingBio] = useState(false)
 const [isEditingName, setIsEditingName] = useState(false)
 const [error, setError] = useState<string>('')
 const [uploadUserAvatar] = useUploadUserAvatarMutation()
 const [updateUserBio] = useUpdateUserBioMutation()
 const [updateUser] = useUpdateUserMutation()

 if (!user) {
  return null
 }

 const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
   setProfileImage(file)
   const reader = new FileReader()
   reader.onloadend = () => {
    setPreviewUrl(reader.result as string)
   }
   reader.readAsDataURL(file)

   // Upload the image immediately
   const uploadReader = new FileReader()
   uploadReader.readAsDataURL(file)
   uploadReader.onloadend = async () => {
    try {
     const base64data = uploadReader.result as string
     const result = await uploadUserAvatar({
      variables: {
       image: base64data,
      },
     })
     if (result.data?.uploadUserAvatar) {
      setUser(result.data.uploadUserAvatar)
      // Clear the profile image state after successful upload
      setProfileImage(null)
      setPreviewUrl('')
     }
    } catch (error) {
     console.error('Error uploading image:', error)
     setError('Failed to upload image. Please try again.')
     // Reset the file input on error
     setProfileImage(null)
     setPreviewUrl('')
    }
   }
  }
 }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')

  try {
   if (bio !== user.bio) {
    const result = await updateUserBio({
     variables: {
      bio,
     },
    })
    if (result.data?.updateUserBio) {
     setUser(result.data.updateUserBio)
     setIsEditingBio(false)
    }
   }

   if (firstName !== user.firstName || lastName !== user.lastName) {
    const result = await updateUser({
     variables: {
      firstName,
      lastName,
     },
    })
    if (result.data?.updateUser) {
     setUser(result.data.updateUser)
     setIsEditingName(false)
    }
   }
  } catch (error) {
   console.error('Error updating profile:', error)
   setError('Failed to update profile. Please try again.')
  }
 }

 const hasChanges =
  bio !== user.bio || firstName !== user.firstName || lastName !== user.lastName

 return (
  <div className="container mx-auto px-4 py-8">
   <div className="max-w-2xl mx-auto">
    <h1 className="text-2xl font-bold mb-6">Profile</h1>
    <div className="bg-white rounded-lg shadow-lg p-6">
     <form onSubmit={handleSubmit}>
      <ErrorMessage error={error} />

      <div className="mb-6">
       <Label>Profile Picture</Label>
       <div className="mt-2 flex flex-col items-center">
        <label className="cursor-pointer">
         <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
         />
         <Avatar className="h-24 w-24 hover:opacity-80 transition-opacity">
          <AvatarImage
           src={
            previewUrl ||
            (user.picture ? `${user.picture}?t=${Date.now()}` : undefined)
           }
          />
          <AvatarFallback>
           {user.firstName?.[0]}
           {user.lastName?.[0]}
          </AvatarFallback>
         </Avatar>
        </label>
        <p className="text-sm mt-2">Click to upload a new photo</p>
       </div>
      </div>

      <div className="mb-6">
       <div className="flex items-center justify-between mb-2">
        <Label>Name</Label>
        {!isEditingName && (
         <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
           setFirstName(user.firstName)
           setLastName(user.lastName || '')
           setIsEditingName(true)
          }}
          className="h-8 w-8 p-0"
         >
          <Pencil className="h-4 w-4" />
         </Button>
        )}
       </div>
       {!isEditingName ? (
        <p className="">
         {user.firstName} {user.lastName}
        </p>
       ) : (
        <div className="space-y-4">
         <div>
          <Label>First Name</Label>
          <input
           type="text"
           value={firstName}
           onChange={(e) => setFirstName(e.target.value)}
           className="w-full p-2 border rounded"
          />
         </div>
         <div>
          <Label>Last Name</Label>
          <input
           type="text"
           value={lastName}
           onChange={(e) => setLastName(e.target.value)}
           className="w-full p-2 border rounded"
          />
         </div>
        </div>
       )}
      </div>

      <div className="mb-6">
       <Label>Email</Label>
       <p className=" mt-2">{user.email}</p>
      </div>

      <div className="mb-6">
       <div className="flex items-center justify-between mb-2">
        <Label>About You</Label>
        {!isEditingBio && (
         <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsEditingBio(true)}
          className="h-8 w-8 p-0"
         >
          <Pencil className="h-4 w-4" />
         </Button>
        )}
       </div>
       {!isEditingBio ? (
        <p className="">{user.bio || 'No bio added yet'}</p>
       ) : (
        <div>
         <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Tell potential partners about your fitness level, best lifts, or previous Hyrox times..."
         />
        </div>
       )}
      </div>

      {(isEditingBio || isEditingName) && (
       <Button type="submit" className="w-full">
        Save Changes
       </Button>
      )}
     </form>
    </div>
   </div>
  </div>
 )
}

export default Profile
