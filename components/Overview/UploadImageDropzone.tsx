import React, { useState } from 'react'
import { Accept, useDropzone } from 'react-dropzone'
import ErrorMessage from '../Layout/ErrorMessage'
import { Upload } from 'lucide-react'

type Props = {
 onDrop: (acceptedFiles: File[]) => void
 onRemove: () => void
 type: string
 accept?: Accept
 description?: string
 currentImage?: string
 showUploadUI?: boolean
}

const UploadImageDropzone = (props: Props) => {
 const {
  onDrop,
  onRemove,
  type,
  accept,
  description,
  currentImage,
  showUploadUI = false,
 } = props
 const [errorMessage, setErrorMessage] = useState<string | null>(null)

 const defaultAccept: Accept = {
  'image/*': ['.png', '.jpg', '.jpeg'],
 }

 const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: (acceptedFiles) => {
   console.log('Accepted Files:', acceptedFiles)
   setErrorMessage(null)
   onDrop(acceptedFiles)
  },
  onDropRejected: (fileRejections) => {
   console.error('Rejected Files:', fileRejections)
   setErrorMessage('File is too large or format is not supported')
  },
  accept: accept || defaultAccept,
  maxSize: type === 'images' ? 10 * 1024 * 1024 : 20 * 1024 * 1024,
 })

 const explanation = description || 'Upload an image'

 if (showUploadUI) {
  return (
   <div
    {...getRootProps()}
    className={`relative w-full min-h-[200px] border-2 border-dashed rounded-lg transition-colors duration-200 flex flex-col items-center justify-center p-6 ${
     isDragActive
      ? 'border-primary bg-primary/5'
      : 'border-gray-300 hover:border-gray-400'
    }`}
   >
    <input {...getInputProps()} />
    <Upload className="h-10 w-10 mb-4" />
    <p className="text-sm text-center">
     <span className="font-semibold">{explanation}</span>
    </p>
    <p className="text-xs mt-2">
     {isDragActive ? 'Drop the file here' : 'Drag & drop or click to select'}
    </p>
    <ErrorMessage error={errorMessage} />
   </div>
  )
 }

 return (
  <div {...getRootProps()} className="relative w-full h-full hover:cursor-pointer">
   <input {...getInputProps()} />
   {currentImage && (
    <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
   )}
   <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
    <p className="text-white text-sm text-center px-2">
     <span className="font-semibold">{explanation}</span>
    </p>
   </div>
   <ErrorMessage error={errorMessage} />
  </div>
 )
}

export default UploadImageDropzone
