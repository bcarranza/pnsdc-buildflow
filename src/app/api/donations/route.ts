import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Input validation helper - sanitize string to prevent XSS
function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null
  // Remove any HTML tags and trim whitespace
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"&]/g, "")
    .trim()
    .slice(0, 255) // Limit length
}

// Validate donation input
function validateDonationInput(body: unknown): {
  valid: boolean
  error?: string
  data?: {
    donor_name: string | null
    is_anonymous: boolean
    amount: number
    material_id: string | null
    proof_image_url: string
  }
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Datos de entrada inválidos" }
  }

  const {
    donor_name,
    is_anonymous,
    amount,
    material_id,
    proof_image_url,
  } = body as Record<string, unknown>

  // Validate is_anonymous
  const isAnon = Boolean(is_anonymous)

  // Validate donor_name (required if not anonymous)
  const sanitizedName = sanitizeString(donor_name as string)
  if (!isAnon && (!sanitizedName || sanitizedName.length === 0)) {
    return {
      valid: false,
      error: "El nombre del donante es requerido si no es anónimo",
    }
  }

  // Validate amount
  const parsedAmount = Number(amount)
  if (isNaN(parsedAmount) || parsedAmount < 1 || parsedAmount > 1000000) {
    return {
      valid: false,
      error: "El monto debe ser entre Q1 y Q1,000,000",
    }
  }

  // Validate proof_image_url
  if (typeof proof_image_url !== "string" || !proof_image_url.trim()) {
    return {
      valid: false,
      error: "El comprobante de depósito es requerido",
    }
  }

  // Validate material_id (optional, but must be valid UUID if provided)
  let validMaterialId: string | null = null
  if (material_id && typeof material_id === "string" && material_id.trim()) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(material_id)) {
      return { valid: false, error: "ID de material inválido" }
    }
    validMaterialId = material_id
  }

  return {
    valid: true,
    data: {
      donor_name: isAnon ? null : sanitizedName,
      is_anonymous: isAnon,
      amount: parsedAmount,
      material_id: validMaterialId,
      proof_image_url: proof_image_url.trim(),
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateDonationInput(body)
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Error de validación" },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // If material_id is provided, verify it exists
    if (validation.data.material_id) {
      const { data: material, error: materialError } = await supabase
        .from("materials")
        .select("id")
        .eq("id", validation.data.material_id)
        .single()

      if (materialError || !material) {
        return NextResponse.json(
          { error: "El material seleccionado no existe" },
          { status: 400 }
        )
      }
    }

    // Insert donation with status pending
    const { data: donation, error: insertError } = await supabase
      .from("donations")
      .insert({
        donor_name: validation.data.donor_name,
        is_anonymous: validation.data.is_anonymous,
        amount: validation.data.amount,
        material_id: validation.data.material_id,
        proof_image_url: validation.data.proof_image_url,
        status: "pending",
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("Error inserting donation:", insertError)
      return NextResponse.json(
        { error: "Error al registrar la donación. Intenta de nuevo." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Donación registrada exitosamente",
        donation_id: donation.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Donation API error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// GET endpoint for fetching donations (for admin use later)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

    const supabase = await createServerSupabaseClient()

    let query = supabase
      .from("donations")
      .select(`
        id,
        donor_name,
        is_anonymous,
        amount,
        proof_image_url,
        status,
        created_at,
        materials(name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query = query.eq("status", status as "pending" | "approved" | "rejected")
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching donations:", error)
      return NextResponse.json(
        { error: "Error al obtener las donaciones" },
        { status: 500 }
      )
    }

    return NextResponse.json({ donations: data })
  } catch (error) {
    console.error("Donations GET error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
