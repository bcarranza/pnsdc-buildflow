"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, MessageCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhotoUpload } from "./PhotoUpload"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

// Form validation schema
const donationSchema = z.object({
  donorName: z.string().optional(),
  isAnonymous: z.boolean(),
  amount: z.number()
    .min(1, "El monto mínimo es Q1")
    .max(1000000, "El monto máximo es Q1,000,000"),
  materialId: z.string().optional(),
}).refine(
  (data) => data.isAnonymous || (data.donorName && data.donorName.trim().length > 0),
  {
    message: "Ingresa tu nombre o selecciona donar de forma anónima",
    path: ["donorName"],
  }
)

type DonationFormValues = z.infer<typeof donationSchema>

interface Material {
  id: string
  name: string
  unit: string
  quantity_needed: number
  quantity_current: number
}

interface DonationFormProps {
  materials: Material[]
}

export function DonationForm({ materials }: DonationFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedAmount, setSubmittedAmount] = useState<number>(0)

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      isAnonymous: false,
      amount: 0,
      materialId: "none",
    },
  })

  const isAnonymous = form.watch("isAnonymous")

  const handleFileSelect = (file: File, url: string) => {
    setSelectedFile(file)
    setPreviewUrl(url)
    setPhotoError(null)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const onSubmit = async (data: DonationFormValues) => {
    // Validate photo
    if (!selectedFile) {
      setPhotoError("Debes subir el comprobante de depósito")
      return
    }

    setIsSubmitting(true)
    setPhotoError(null)

    try {
      const supabase = createClient()

      // Upload image to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("proof-images")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw new Error("Error al subir la imagen: " + uploadError.message)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("proof-images")
        .getPublicUrl(fileName)

      // Submit donation via API
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donor_name: data.isAnonymous ? null : data.donorName?.trim(),
          is_anonymous: data.isAnonymous,
          amount: data.amount,
          material_id: data.materialId && data.materialId !== "none" ? data.materialId : null,
          proof_image_url: urlData.publicUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al enviar la donación")
      }

      setSubmittedAmount(data.amount)
      setIsSuccess(true)
    } catch (error) {
      console.error("Donation submission error:", error)
      setPhotoError(
        error instanceof Error ? error.message : "Error al enviar la donación"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success screen
  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            ¡Gracias por tu donación!
          </h2>
          <p className="text-green-700 mb-6">
            Tu donación de <strong>Q{submittedAmount.toLocaleString()}</strong> está
            pendiente de aprobación.
          </p>
          <p className="text-sm text-green-600 mb-8">
            Recibirás una confirmación cuando sea verificada por la parroquia.
          </p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700 min-h-[48px]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-amber-800 text-center">
          Registrar Donación
        </CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Completa el formulario para registrar tu donación
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Donor Name Field */}
            <FormField
              control={form.control}
              name="donorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Nombre del donante
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu nombre completo"
                      {...field}
                      disabled={isAnonymous}
                      className={`min-h-[48px] ${
                        isAnonymous ? "bg-gray-100 text-gray-400" : ""
                      }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anonymous Checkbox */}
            <FormField
              control={form.control}
              name="isAnonymous"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked)
                        if (checked) {
                          form.setValue("donorName", "")
                        }
                      }}
                      className="mt-1 h-5 w-5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 cursor-pointer">
                      Donar de forma anónima
                    </FormLabel>
                    <p className="text-xs text-gray-500">
                      Tu nombre no aparecerá en el muro de donantes
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Amount Field */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Monto (Q) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                        Q
                      </span>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="0.00"
                        min={1}
                        step="0.01"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="pl-8 min-h-[48px]"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Material Selection */}
            <FormField
              control={form.control}
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    ¿Para qué material? (opcional)
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="min-h-[48px]">
                        <SelectValue placeholder="Sin preferencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin preferencia</SelectItem>
                      {materials.map((material) => {
                        const progress = Math.round(
                          (material.quantity_current / material.quantity_needed) * 100
                        )
                        return (
                          <SelectItem key={material.id} value={material.id}>
                            <span className="flex items-center gap-2">
                              {material.name}
                              <span className="text-xs text-gray-500">
                                ({progress}% completado)
                              </span>
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <PhotoUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              error={photoError || undefined}
            />

            {/* WhatsApp Fallback */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    ¿Problemas para subir la imagen?
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Envía tu comprobante por WhatsApp:
                  </p>
                  <a
                    href="https://wa.me/50212345678?text=Hola,%20quiero%20registrar%20mi%20donaci%C3%B3n%20para%20el%20sal%C3%B3n%20parroquial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors min-h-[44px]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold min-h-[52px] text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Donación"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
