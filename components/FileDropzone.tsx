import React from 'react'
import { Accept, useDropzone } from 'react-dropzone'

type Props = {
 onDrop: (acceptedFiles: File[]) => void
 file: File
 onRemove: (type: string) => () => void
 type: string
 placeholder?: React.ReactNode
}

const FileDropzone = (props: Props) => {
 const { onDrop, file, onRemove, type, placeholder } = props
 const acceptedFileTypes: Accept = {
  documents: ['.pdf', '.doc', '.docx'],
  images: ['.png', '.jpg', '.jpeg'],
 }

 const { getRootProps, getInputProps } = useDropzone({
  onDrop,
  maxSize: type === 'images' ? 10 * 1024 * 1024 : 20 * 1024 * 1024, // 10MB for images, 20MB for documents
  accept: acceptedFileTypes,
 })

 const baseStyle = 'border-2 border-dashed p-3 rounded-md text-center'
 const defaultStyle = 'hover:cursor-pointer border-gray-300'
 const uploadedStyle = 'bg-green-50 border-green-300'

 const currentStyle = file
  ? `${baseStyle} ${uploadedStyle}`
  : `${baseStyle} ${defaultStyle}`

 return (
  <div {...getRootProps()} className={currentStyle}>
   <input {...getInputProps()} />
   {file ? (
    <>
     <p className="">
      <span className="font-semibold">{file.name}</span>
     </p>
     <button
      className="text-red-500 text-xs"
      onClick={(e) => {
       e.stopPropagation()
       onRemove(type)()
      }}
     >
      Remove
     </button>
    </>
   ) : (
    <p className="">
     <span className="font-semibold">Upload a scorecard</span> or drag and drop
     (optional)
    </p>
   )}
  </div>
 )
}

export default FileDropzone
