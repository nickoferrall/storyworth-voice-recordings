import React, { useEffect, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import TextInput from '../TextInput'
import axios from 'axios'
import UploadImageDropzone from './UploadImageDropzone'
import { useUploadCompetitionLogoMutation } from '../../src/generated/graphql'
import ErrorMessage from '../Layout/ErrorMessage'

type Props = {
  open: boolean
  competitionId: string
  onClose: () => void
  refetch?: () => void
}
type UnsplashImage = {
  id: string
  alt_description: string
  urls: {
    thumb: string
    regular: string
  }
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const EditDetailsModal = ({ open, onClose, competitionId, refetch }: Props) => {
  const [imageSearch, setImageSearch] = useState('')
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([])
  const [selectedImage, setSelectedImage] = useState('')
  const [uploadCompetitionLogo] = useUploadCompetitionLogoMutation()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const debouncedSearchTerm = useDebounce(imageSearch, 500)

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchImages(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])

  const fetchImages = async (searchTerm: string) => {
    if (searchTerm) {
      try {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
        )
        setUnsplashImages(response.data.results)
      } catch (error: any) {
        console.error('Error fetching images from Unsplash', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!competitionId || !selectedImage) {
      setUploadError('Please select an image first')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      await uploadCompetitionLogo({
        variables: {
          image: selectedImage,
          competitionId,
        },
      })
      // Refresh the competition data to show the new logo
      if (refetch) {
        await refetch()
      }
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setUploadError('Failed to upload competition logo')
    } finally {
      setUploading(false)
    }
    setImageSearch('')
    setSelectedImage('')
    onClose()
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return
    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', files[0])
      formData.append('upload_preset', 'fitova')

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dkeppgndn/image/upload`,
        formData,
      )
      setSelectedImage(response.data.secure_url)
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error)
      setUploadError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Competition Image</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col justify-start items-center h-full">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex-1 mt-2 mb-6">
              <label className="block text-sm py-2">Change Image</label>
              {selectedImage && (
                <div className="relative w-[250px] h-[250px] rounded-xl overflow-hidden mb-3">
                  <img
                    src={selectedImage}
                    alt="Event Logo"
                    width={250}
                    height={250}
                    className="transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  />
                </div>
              )}
              <UploadImageDropzone
                onDrop={handleImageUpload}
                onRemove={() => setSelectedImage('')}
                type="images"
                showUploadUI={true}
              />
              {uploading && <p>Uploading...</p>}
              <ErrorMessage error={uploadError} />
              <TextInput
                name="imageSearch"
                className="mt-4"
                label="Search Web Images"
                placeholder="Search for images..."
                value={imageSearch}
                onChange={(e) => setImageSearch(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2 mt-4 max-h-96 overflow-y-auto">
                {unsplashImages.map((image) => (
                  <img
                    key={image.id}
                    src={image.urls.thumb}
                    alt={image.alt_description}
                    className="cursor-pointer object-cover h-48 w-full rounded"
                    onClick={() => handleImageSelect(image.urls.regular)}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || !selectedImage}>
                {uploading ? 'Uploading...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditDetailsModal
