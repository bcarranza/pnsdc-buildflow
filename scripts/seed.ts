import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
  if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedFundraisingGoal() {
  console.log('Seeding fundraising goal...')

  // Check if goal already exists
  const { data: existing } = await supabase
    .from('fundraising_goal')
    .select('id')
    .limit(1)
    .single()

  if (existing) {
    // Update existing goal
    const { error } = await supabase
      .from('fundraising_goal')
      .update({ goal_amount: 1000000 })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating fundraising goal:', error.message)
      throw error
    }
    console.log('  Fundraising goal updated: Q1,000,000')
  } else {
    // Insert new goal
    const { error } = await supabase
      .from('fundraising_goal')
      .insert({ goal_amount: 1000000, current_amount: 0 })

    if (error) {
      console.error('Error inserting fundraising goal:', error.message)
      throw error
    }
    console.log('  Fundraising goal created: Q1,000,000 (current: Q0)')
  }
}

async function seedMaterials() {
  console.log('Seeding materials...')

  const materials = [
    { name: 'Bolsas de cemento', unit: 'bolsa', quantity_needed: 200, quantity_current: 0 },
    { name: 'Hierro', unit: 'quintal', quantity_needed: 50, quantity_current: 0 },
    { name: 'Block', unit: 'unidad', quantity_needed: 1000, quantity_current: 0 },
    { name: 'Arena', unit: 'metro³', quantity_needed: 20, quantity_current: 0 },
    { name: 'Piedrín', unit: 'metro³', quantity_needed: 15, quantity_current: 0 },
  ]

  for (const material of materials) {
    // Check if material already exists
    const { data: existing } = await supabase
      .from('materials')
      .select('id')
      .eq('name', material.name)
      .limit(1)
      .single()

    if (existing) {
      // Update existing material (keep current quantities)
      const { error } = await supabase
        .from('materials')
        .update({ unit: material.unit, quantity_needed: material.quantity_needed })
        .eq('id', existing.id)

      if (error) {
        console.error(`Error updating material "${material.name}":`, error.message)
        throw error
      }
    } else {
      // Insert new material
      const { error } = await supabase
        .from('materials')
        .insert(material)

      if (error) {
        console.error(`Error inserting material "${material.name}":`, error.message)
        throw error
      }
    }

    console.log(`  ${material.name}: 0 de ${material.quantity_needed} ${material.unit}`)
  }
}

async function seedAdmin() {
  console.log('Seeding admin account...')

  const pin = '1234'
  const saltRounds = 10
  const pinHash = await bcrypt.hash(pin, saltRounds)

  // Check if admin already exists
  const { data: existing } = await supabase
    .from('admins')
    .select('id')
    .eq('name', 'Administrador')
    .limit(1)
    .single()

  if (existing) {
    // Update existing admin
    const { error } = await supabase
      .from('admins')
      .update({ pin_hash: pinHash })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating admin:', error.message)
      throw error
    }
    console.log('  Admin account updated: "Administrador" (PIN: 1234)')
  } else {
    // Insert new admin
    const { error } = await supabase
      .from('admins')
      .insert({ name: 'Administrador', pin_hash: pinHash })

    if (error) {
      console.error('Error inserting admin:', error.message)
      throw error
    }
    console.log('  Admin account created: "Administrador" (PIN: 1234)')
  }
}

async function main() {
  console.log('\n=== PNSDC-buildFlow Seed Script ===\n')

  try {
    await seedFundraisingGoal()
    await seedMaterials()
    await seedAdmin()

    console.log('\n=== Seed completed successfully! ===\n')
  } catch (error) {
    console.error('\nSeed failed:', error)
    process.exit(1)
  }
}

main()
