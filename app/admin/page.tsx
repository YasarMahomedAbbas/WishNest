"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

type MeResponse = {
  success: true
  user: { id: string; email: string; name: string; isAdmin: boolean }
}

type FamiliesResponse = {
  success: true
  data: {
    families: Array<{
      id: string
      name: string
      description?: string | null
      inviteCode: string
      createdAt: string
      updatedAt: string
      memberCount: number
      members: Array<{
        id: string
        role: string
        joinedAt: string
        user: { id: string; name: string; email: string }
      }>
    }>
    totalCount: number
  }
}

type UsersResponse = {
  success: true
  data: {
    users: Array<{
      id: string
      email: string
      name: string
      isAdmin: boolean
      emailVerified: boolean
      createdAt: string
      updatedAt: string
      accountLocked: boolean
      failedLoginAttempts: number
      statistics: { wishlistItems: number; reservations: number; familyMemberships: number }
      families: Array<{
        membershipId: string
        role: string
        status: string
        joinedAt: string
        family: { id: string; name: string }
      }>
    }>
    totalCount: number
    adminCount: number
  }
}

type StatsResponse = {
  success: true
  data: {
    overview: {
      totalUsers: number
      totalFamilies: number
      totalWishlistItems: number
      totalReservations: number
      activeFamilyMemberships: number
      adminUsers: number
      lockedUsers: number
    }
    recent: { newUsersLast30Days: number; newFamiliesLast30Days: number }
    familyStats: {
      averageFamilySize: number
      smallFamilies: number
      mediumFamilies: number
      largeFamilies: number
    }
    topFamilies: Array<{ id: string; name: string; memberCount: number; totalWishlistItems: number }>
    systemHealth: {
      totalUsers: number
      activeUsers: number
      lockedUsers: number
      adminUsers: number
      healthScore: number
    }
  }
}

export default function AdminPage() {
  const [me, setMe] = useState<MeResponse["user"] | null>(null)
  const [families, setFamilies] = useState<FamiliesResponse["data"] | null>(null)
  const [users, setUsers] = useState<UsersResponse["data"] | null>(null)
  const [stats, setStats] = useState<StatsResponse["data"] | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError("")

        // Who am I
        const meRes = await fetch("/api/auth/me")
        const meJson = await meRes.json()
        if (!meRes.ok || !meJson?.success) throw new Error(meJson?.error?.message || "Unauthorized")
        setMe(meJson.user)

        if (!meJson.user?.isAdmin) {
          setError("You must be an admin to view this page.")
          return
        }

        // Parallel fetch admin data
        const [familiesRes, usersRes, statsRes] = await Promise.all([
          fetch("/api/admin/families"),
          fetch("/api/admin/users"),
          fetch("/api/admin/stats"),
        ])

        const [familiesJson, usersJson, statsJson] = await Promise.all([
          familiesRes.json(),
          usersRes.json(),
          statsRes.json(),
        ])

        if (familiesRes.ok && familiesJson?.success) setFamilies(familiesJson.data)
        if (usersRes.ok && usersJson?.success) setUsers(usersJson.data)
        if (statsRes.ok && statsJson?.success) setStats(statsJson.data)
      } catch (e: any) {
        setError(e?.message || "Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="loading-page">
        <div className="flex items-center gap-3 text-body">
          <div className="loading-spinner" />
          <span className="text-sm">Loading admin dashboard…</span>
        </div>
      </div>
    )
  }

  if (error || !me) {
    return (
      <div className="app-page">
        <div className="app-container max-w-xl">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-heading">Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive mb-3">{error || "Unable to determine user."}</p>
              <Button className="btn-primary" onClick={() => (window.location.href = "/auth")}>Go to Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!me.isAdmin) {
    return (
      <div className="app-page">
        <div className="app-container max-w-xl">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-heading">Access denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-body mb-3">You must be an admin to view this page.</p>
              <Button className="btn-primary" onClick={() => (window.location.href = "/")}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="app-page">
      <div className="app-container max-w-6xl space-y-6">
        <div className="flex-between">
          <div>
            <h1 className="text-brand text-2xl">Admin Dashboard</h1>
            <p className="text-body">Welcome, {me.name}</p>
          </div>
          <Button
            className="btn-primary"
            onClick={() => (window.location.href = "/")}
          >
            Return to app
          </Button>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 content-section">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-brand">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-brand">{stats?.overview.totalUsers ?? "-"}</div>
              <div className="text-caption">Admins: {stats?.overview.adminUsers ?? "-"}</div>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-brand">Families</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-brand">{stats?.overview.totalFamilies ?? "-"}</div>
              <div className="text-caption">Avg size: {stats?.familyStats.averageFamilySize ?? "-"}</div>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-brand">Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-brand">{stats?.systemHealth.healthScore ?? "-"}%</div>
              <div className="text-caption">Locked: {stats?.systemHealth.lockedUsers ?? "-"}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="families" className="content-section">
          <TabsList className="surface-elevated">
            <TabsTrigger value="families">Families</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="families">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="text-brand">All Families ({families?.totalCount ?? 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {families?.families?.map((f) => (
                    <div key={f.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between text-sm">
                        <div className="font-medium text-body">{f.name}</div>
                        <div className="text-caption">Members: {f.memberCount}</div>
                      </div>
                      {f.description && (
                        <div className="text-caption mt-1">{f.description}</div>
                      )}
                      <div className="mt-2 text-caption">
                        {f.members.slice(0, 5).map((m) => (
                          <span key={m.id} className="inline-block mr-2">
                            {m.user.name} ({m.role})
                          </span>
                        ))}
                        {f.members.length > 5 && <span>…</span>}
                      </div>
                    </div>
                  ))}
                  {!families?.families?.length && (
                    <div className="text-sm text-caption">No families found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="surface-card">
              <CardHeader>
                <CardTitle className="text-brand">All Users ({users?.totalCount ?? 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.users?.map((u) => (
                    <div key={u.id} className="p-3 border rounded-lg text-sm">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium text-body">{u.name} {u.isAdmin && <span className="text-amber-700 text-xs ml-1">(admin)</span>}</div>
                          <div className="text-caption">{u.email}</div>
                        </div>
                        <div className="text-caption">
                          Items: {u.statistics.wishlistItems} • Reservations: {u.statistics.reservations} • Families: {u.statistics.familyMemberships}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-slate-600">
                        {u.families.slice(0, 5).map((m) => (
                          <span key={m.membershipId} className="inline-block mr-2">
                            {m.family.name} ({m.role})
                          </span>
                        ))}
                        {u.families.length > 5 && <span>…</span>}
                      </div>
                    </div>
                  ))}
                  {!users?.users?.length && (
                    <div className="text-sm text-caption">No users found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

