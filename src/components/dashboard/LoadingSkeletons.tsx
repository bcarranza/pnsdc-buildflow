'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function ThermometerSkeleton() {
  return (
    <Card className="border-amber-200 shadow-sm animate-pulse">
      <CardHeader className="text-center pb-2">
        <div className="h-7 bg-gray-200 rounded w-48 mx-auto mb-2" />
        <div className="h-5 bg-gray-200 rounded w-32 mx-auto" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="h-12 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-28 mb-4" />
          <div className="w-24 h-64 bg-gray-200 rounded-full" />
          <div className="h-8 bg-gray-200 rounded w-24 mt-4" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MaterialsListSkeleton() {
  return (
    <Card className="border-amber-200 shadow-sm animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-6 bg-gray-200 rounded w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-5 bg-gray-200 rounded w-32" />
                <div className="h-5 bg-gray-200 rounded w-20" />
              </div>
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DonorWallSkeleton() {
  return (
    <Card className="border-amber-200 shadow-sm animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-6 bg-gray-200 rounded w-40" />
      </CardHeader>
      <CardContent>
        {/* Filter controls skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-9 bg-gray-200 rounded w-40" />
          <div className="h-9 bg-gray-200 rounded w-44" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-amber-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-24" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <ThermometerSkeleton />
      <MaterialsListSkeleton />
      <DonorWallSkeleton />
    </div>
  )
}
