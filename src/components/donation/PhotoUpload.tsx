"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, Camera, X, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import imageCompression from "browser-image-compression"

interface PhotoUploadProps {
  onFileSelect: (file: File, previewUrl: string) => void
  onFileRemove: () => void
  selectedFile: File | null
  previewUrl: string | null
  error?: string
}

export function PhotoUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  previewUrl,
  error,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressAndSetImage = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/") || !["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        return
      }

      setIsCompressing(true)
      setCompressionProgress(0)

      try {
        let processedFile = file

        // Compress if over 1MB
        if (file.size > 1024 * 1024) {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            onProgress: (progress: number) => {
              setCompressionProgress(Math.round(progress))
            },
          }
          processedFile = await imageCompression(file, options)
        }

        // Create preview URL
        const reader = new FileReader()
        reader.onloadend = () => {
          onFileSelect(processedFile, reader.result as string)
          setIsCompressing(false)
        }
        reader.readAsDataURL(processedFile)
      } catch (err) {
        console.error("Error compressing image:", err)
        setIsCompressing(false)
      }
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        compressAndSetImage(file)
      }
    },
    [compressAndSetImage]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        compressAndSetImage(file)
      }
    },
    [compressAndSetImage]
  )

  const handleRemove = useCallback(() => {
    onFileRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onFileRemove])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Comprobante de depósito <span className="text-red-500">*</span>
      </label>

      {!selectedFile && !isCompressing ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
            "flex flex-col items-center justify-center min-h-[160px]",
            isDragging
              ? "border-amber-500 bg-amber-50"
              : error
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-amber-400 hover:bg-amber-50/50"
          )}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm font-medium text-gray-700 text-center">
            Subir comprobante de depósito
          </p>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Arrastra una imagen o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-400 mt-2 text-center">
            JPG, PNG (máx. 5MB, se comprimirá automáticamente)
          </p>

          {/* Mobile camera option */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors min-h-[48px]"
            >
              <Camera className="h-5 w-5" />
              <span className="hidden sm:inline">Tomar foto</span>
              <span className="sm:hidden">Foto</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Seleccionar imagen del comprobante"
          />
        </div>
      ) : isCompressing ? (
        <div className="border-2 border-amber-300 bg-amber-50 rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px]">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-amber-700">
            Comprimiendo imagen...
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {compressionProgress}% completado
          </p>
        </div>
      ) : (
        <div className="relative border-2 border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Vista previa del comprobante"
                className="w-24 h-24 object-cover rounded-lg border border-green-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Imagen cargada</span>
              </div>
              {selectedFile && (
                <>
                  <p className="text-sm text-gray-600 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label="Eliminar imagen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  )
}
