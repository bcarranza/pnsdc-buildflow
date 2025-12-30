'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

interface FundraisingData {
  current_amount: number
  goal_amount: number
}

interface Material {
  id: string
  name: string
  unit: string
  quantity_needed: number
  quantity_current: number
}

interface Donation {
  id: string
  donor_name: string | null
  is_anonymous: boolean
  amount: number
  created_at: string
  material_name?: string | null
}

interface DashboardData {
  fundraising: FundraisingData
  materials: Material[]
  donations: Donation[]
}

interface UseRealtimeDashboardOptions {
  initialData: DashboardData
  pollingInterval?: number // Fallback polling interval in ms
}

export function useRealtimeDashboard({
  initialData,
  pollingInterval = 60000, // 60 seconds fallback
}: UseRealtimeDashboardOptions) {
  const [data, setData] = useState<DashboardData>(initialData)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Create Supabase client for realtime
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch fresh data from API
  const refreshData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const result = await response.json()
        if (result.fundraising && result.materials && result.donations) {
          setData({
            fundraising: result.fundraising,
            materials: result.materials,
            donations: result.donations,
          })
          setLastUpdated(new Date())
        }
      }
    } catch (error) {
      console.error('Error refreshing dashboard data:', error)
    }
  }, [])

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let pollingTimer: NodeJS.Timeout | null = null

    const setupRealtime = async () => {
      try {
        // Subscribe to realtime changes
        channel = supabase
          .channel('dashboard-realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'donations',
            },
            (payload) => {
              console.log('Donation change detected:', payload.eventType)
              // Refresh all data when any donation changes
              refreshData()
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'fundraising_goal',
            },
            (payload) => {
              console.log('Fundraising goal change detected:', payload.eventType)
              refreshData()
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'materials',
            },
            (payload) => {
              console.log('Materials change detected:', payload.eventType)
              refreshData()
            }
          )
          .subscribe((status) => {
            console.log('Realtime subscription status:', status)
            setIsConnected(status === 'SUBSCRIBED')

            // If realtime fails, fall back to polling
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.log('Realtime failed, falling back to polling')
              startPolling()
            }
          })
      } catch (error) {
        console.error('Error setting up realtime:', error)
        startPolling()
      }
    }

    const startPolling = () => {
      if (pollingTimer) return
      console.log(`Starting fallback polling every ${pollingInterval / 1000}s`)
      pollingTimer = setInterval(refreshData, pollingInterval)
    }

    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer)
        pollingTimer = null
      }
    }

    // Setup realtime
    setupRealtime()

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      stopPolling()
    }
  }, [supabase, refreshData, pollingInterval])

  return {
    data,
    isConnected,
    lastUpdated,
    refresh: refreshData,
  }
}
