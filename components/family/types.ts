export interface Family {
  id: string
  name: string
  description: string | null
  inviteCode: string
  membershipRole: 'ADMIN' | 'MEMBER'
  membershipStatus: string
  joinedAt: string
  createdAt: string
  updatedAt: string
  members?: FamilyMember[]
}

export interface FamilyMember {
  id: string
  userId: string
  role: 'ADMIN' | 'MEMBER'
  status: string
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface InviteInfo {
  family: {
    id: string
    name: string
    description: string | null
    inviteCode: string
    memberCount: number
    isAtMemberLimit: boolean
  }
  inviteLink: string
} 