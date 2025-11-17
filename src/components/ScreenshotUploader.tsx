import { useState, useRef } from 'react'
import { useUploadImageMutation } from '../api/apiSlice'

interface ScreenshotUploaderProps {
  onUploadComplete: (url: string) => void
  existingImages?: string[]
  className?: string
}

export default function ScreenshotUploader({
  onUploadComplete,
  existingImages = [],
  className = '',
}: ScreenshotUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadImage, { isLoading }] = useUploadImageMutation()

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Compress and upload
    try {
      const formData = new FormData()
      
      // Simple compression: resize if too large
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = async () => {
        const maxWidth = 1920
        const maxHeight = 1080
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height * maxWidth) / width
            width = maxWidth
          } else {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          async (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
              formData.append('image', compressedFile)
              
              try {
                const result = await uploadImage(formData).unwrap()
                onUploadComplete(result.url)
                setPreview(null)
              } catch (error) {
                console.error('Upload failed:', error)
                alert('Failed to upload image')
              }
            }
          },
          'image/jpeg',
          0.8
        )
      }
      
      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Failed to process image')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
        `}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click()
          }
        }}
        aria-label="Upload screenshot"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleFileSelect(file)
            }
          }}
        />
        {isLoading ? (
          <p className="text-gray-600">Uploading...</p>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </>
        )}
      </div>

      {preview && (
        <div className="mt-4">
          <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
        </div>
      )}

      {existingImages.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {existingImages.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Screenshot ${idx + 1}`}
              className="w-full h-24 object-cover rounded border border-gray-200"
            />
          ))}
        </div>
      )}
    </div>
  )
}

