"use client"

import { Crown, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type Family } from './types'

interface FamilyOverviewCardProps {
  family: Family
  onAdvancedSettings: () => void
  children?: React.ReactNode // For the InviteDialog
}

export function FamilyOverviewCard({ family, onAdvancedSettings, children }: FamilyOverviewCardProps) {
  return (
    <Card className="surface-card">
      <CardHeader>
                  <div className="flex-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-900 text-2xl">
              {family.name}
              {family.membershipRole === 'ADMIN' && (
                <Crown className="h-5 w-5 text-yellow-500" />
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 text-base mt-1">
              {family.description || 'No description'}
            </CardDescription>
          </div>
          <Badge variant={family.membershipRole === 'ADMIN' ? 'default' : 'secondary'} className="rounded-xl">
            {family.membershipRole}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-brand bg-clip-text text-transparent">
              {family.members?.length || 0}
            </div>
            <div className="text-sm text-slate-600">Members</div>
          </div>
          <div className="text-center">
                <div className="text-3xl font-bold text-brand bg-clip-text text-transparent">
                {new Date(family.createdAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-slate-600">Created</div>
          </div>
            <div className="text-center">
                <div className="text-3xl font-bold text-brand bg-clip-text text-transparent">
              {new Date(family.joinedAt).toLocaleDateString()}
            </div>
            <div className="text-sm text-slate-600">You Joined</div>
          </div>
        </div>
        
        {family.membershipRole === 'ADMIN' && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 