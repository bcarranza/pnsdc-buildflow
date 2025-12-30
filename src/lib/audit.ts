import { createAdminClient } from './supabase/server'
import type { AuditActionType, AuditTargetType, NewAuditLogEntry } from '@/types/database.types'

/**
 * Log an admin action to the audit log
 */
export async function logAuditEvent(entry: NewAuditLogEntry): Promise<void> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('audit_log')
      .insert({
        action_type: entry.action_type,
        admin_id: entry.admin_id || null,
        admin_name: entry.admin_name || null,
        target_type: entry.target_type,
        target_id: entry.target_id || null,
        old_value: entry.old_value || null,
        new_value: entry.new_value || null,
        description: entry.description,
      })

    if (error) {
      // Log error but don't throw - audit logging shouldn't break main operations
      console.error('Failed to log audit event:', error)
    }
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

/**
 * Helper to create audit log entries for common actions
 */
export const auditHelpers = {
  approveDonation: (
    adminId: string,
    adminName: string,
    donationId: string,
    donorName: string | null,
    amount: number
  ): NewAuditLogEntry => ({
    action_type: 'approve_donation',
    admin_id: adminId,
    admin_name: adminName,
    target_type: 'donation',
    target_id: donationId,
    old_value: { status: 'pending' },
    new_value: { status: 'approved', amount },
    description: `Aprobó donación de Q${amount.toLocaleString()} de ${donorName || 'Anónimo'}`,
  }),

  rejectDonation: (
    adminId: string,
    adminName: string,
    donationId: string,
    donorName: string | null,
    amount: number,
    reason?: string
  ): NewAuditLogEntry => ({
    action_type: 'reject_donation',
    admin_id: adminId,
    admin_name: adminName,
    target_type: 'donation',
    target_id: donationId,
    old_value: { status: 'pending' },
    new_value: { status: 'rejected', reason: reason || null },
    description: `Rechazó donación de Q${amount.toLocaleString()} de ${donorName || 'Anónimo'}${reason ? ` - Razón: ${reason}` : ''}`,
  }),

  manualDonation: (
    adminId: string,
    adminName: string,
    donationId: string,
    donorName: string | null,
    amount: number
  ): NewAuditLogEntry => ({
    action_type: 'manual_donation',
    admin_id: adminId,
    admin_name: adminName,
    target_type: 'donation',
    target_id: donationId,
    new_value: { amount, donor_name: donorName || 'Anónimo' },
    description: `Agregó donación manual de Q${amount.toLocaleString()} de ${donorName || 'Anónimo'}`,
  }),

  updateMaterial: (
    adminId: string,
    adminName: string,
    materialId: string,
    materialName: string,
    oldQuantity: number,
    newQuantity: number
  ): NewAuditLogEntry => ({
    action_type: 'update_material',
    admin_id: adminId,
    admin_name: adminName,
    target_type: 'material',
    target_id: materialId,
    old_value: { quantity_current: oldQuantity },
    new_value: { quantity_current: newQuantity },
    description: `Actualizó ${materialName}: ${oldQuantity} → ${newQuantity}`,
  }),
}
