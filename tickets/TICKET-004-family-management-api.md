# TICKET-004: Family Management API

## Metadata
- **Epic**: Phase 2 - Family Management System
- **Story Points**: 8
- **Priority**: High
- **Type**: Feature
- **Status**: Backlog
- **Sprint**: 2

## User Story
As a **family admin**, I want to **create and manage family groups** so that **I can organize family members and control access to our shared wishlists**.

## Acceptance Criteria
- [ ] User can create a new family group
- [ ] Family groups have unique invite codes
- [ ] Family admin can manage family settings
- [ ] Family admin can view all family members
- [ ] Family admin can remove family members
- [ ] Users can belong to multiple families
- [ ] Family names can be updated by admins

## Technical Requirements
- Generate secure random invite codes (8 characters)
- Implement role-based access control (admin, member)
- Ensure invite codes are unique across all families
- Handle family member role transitions
- Validate family operations against user permissions

## API Endpoints to Create
- `POST /api/families` - Create new family
- `GET /api/families/me` - Get user's families
- `PUT /api/families/:id` - Update family settings
- `DELETE /api/families/:id` - Delete family (admin only)
- `GET /api/families/:id/members` - List family members
- `DELETE /api/families/:id/members/:userId` - Remove member

## Data Models
```typescript
interface Family {
  id: string
  name: string
  inviteCode: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface FamilyMember {
  familyId: string
  userId: string
  role: 'admin' | 'member'
  joinedAt: Date
}
```

## Business Rules
- Family creator automatically becomes admin
- Family must have at least one admin
- Invite codes expire after 30 days of inactivity
- Family names must be 3-50 characters
- Maximum 20 members per family

## Definition of Done
- [ ] All family management endpoints implemented
- [ ] Role-based authorization working
- [ ] Invite code generation tested
- [ ] Family member management functional
- [ ] API validation and error handling complete
- [ ] Database constraints enforced

## Dependencies
- TICKET-001 (Database Schema Setup)
- TICKET-002 (API Infrastructure Setup)
- TICKET-003 (User Authentication System)

## Files to Create
- `app/api/families/route.ts`
- `app/api/families/me/route.ts`
- `app/api/families/[id]/route.ts`
- `app/api/families/[id]/members/route.ts`
- `lib/family-utils.ts` - Family management utilities
- `lib/invite-codes.ts` - Invite code generation

## Notes
- Consider implementing family activity logging
- Plan for future family settings expansion
- Ensure proper cascade deletion handling 