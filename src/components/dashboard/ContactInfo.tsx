'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Building2, Copy, Check, MessageCircle } from 'lucide-react'

// Contact data (placeholder - can be made configurable later)
const contactData = {
  parish: {
    name: 'Parroquia Nuestra Señora del Carmen',
    address: '4a Calle 2-30 Zona 1, Jalapa, Guatemala',
    phone: '+502 7922-4123',
  },
  bank: {
    name: 'Banco Industrial',
    accountNumber: '001-123456-7',
    accountHolder: 'Parroquia Nuestra Señora del Carmen',
    accountType: 'Monetaria',
  },
  whatsapp: {
    number: '+502 5555-1234',
    message: 'Hola, tengo una consulta sobre la donación para el salón parroquial.',
  },
}

export function ContactInfo() {
  const [copied, setCopied] = useState(false)

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(contactData.bank.accountNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = contactData.bank.accountNumber
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const whatsappUrl = `https://wa.me/${contactData.whatsapp.number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(contactData.whatsapp.message)}`

  return (
    <div className="space-y-6">
      {/* Address & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-4 bg-carmelite-50 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-carmelite-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-carmelite-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-medium text-carmelite-800 mb-1">Dirección</h3>
            <p className="text-gray-700 text-sm">
              {contactData.parish.address}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-carmelite-50 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-carmelite-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-carmelite-600" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-medium text-carmelite-800 mb-1">Teléfono</h3>
            <a
              href={`tel:${contactData.parish.phone.replace(/\s/g, '')}`}
              className="text-carmelite-600 hover:text-carmelite-700 font-medium text-sm underline"
              aria-label="Llamar al teléfono de la parroquia"
            >
              {contactData.parish.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Bank Account */}
      <div className="p-4 bg-white border border-carmelite-200 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-carmelite-600" aria-hidden="true" />
          <h3 className="font-medium text-carmelite-800">Datos Bancarios</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Banco:</span>
            <span className="font-medium text-gray-800">{contactData.bank.name}</span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-500">Cuenta:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-gray-800">
                {contactData.bank.accountNumber}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAccount}
                className="h-8 px-2 border-carmelite-300 hover:bg-carmelite-50"
                aria-label={copied ? 'Número de cuenta copiado' : 'Copiar número de cuenta'}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="ml-1 text-green-600 text-xs">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-carmelite-600" />
                    <span className="ml-1 text-carmelite-600 text-xs">Copiar</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Titular:</span>
            <span className="font-medium text-gray-800 text-right">
              {contactData.bank.accountHolder}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Tipo:</span>
            <span className="font-medium text-gray-800">{contactData.bank.accountType}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="text-center">
        <p className="text-gray-600 mb-3">¿Tienes preguntas sobre tu donación?</p>
        <Button
          asChild
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-5 h-5 mr-2" aria-hidden="true" />
            Contactar por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}
