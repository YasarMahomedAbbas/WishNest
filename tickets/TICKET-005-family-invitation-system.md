# TICKET-005: Family Invitation System

## Metadata
- **Epic**: Phase 2 - Family Management System
- **Story Points**: 5
- **Priority**: High
- **Type**: Feature
- **Status**: Backlog
- **Sprint**: 2

## User Story
As a **family member**, I want to **invite others to join my family** so that **we can share wishlists together**.

## Acceptance Criteria
- [ ] Family admins can generate invitation links
- [ ] Users can join families using invite codes
- [ ] Invite links work when shared via any method
- [ ] New members automatically get 'member' role
- [ ] Duplicate invitations are handled gracefully
- [ ] Invalid/expired invite codes show appropriate errors

## Technical Requirements
- Validate invite codes before allowing joins
- Prevent users from joining the same family twice
- Handle expired or invalid invite codes gracefully
- Generate shareable invitation URLs
- Log family join activities

## API Endpoints to Create
- `POST /api/families/:id/invite` - Generate new invite code
- `POST /api/families/join/:code` - Join family via invite code
- `GET /api/families/join/:code/info` - Get family info for invite preview

## User Flows
1. **Generate Invite**:
   - Admin clicks "Invite Members"
   - System generates unique invite code
   - Admin shares invite link with family members

2. **Join Family**:
   - User clicks invite link or enters code
   - System validates code and shows family info
   - User confirms joining
   - User added to family as member

## Data Models
```typescript
interface InviteInfo {
  familyName: string
  memberCount: number
  invitedBy: string
  isValid: boolean
}

interface JoinRequest {
  inviteCode: string
  userId: string
}
```

## Business Rules
- Only family admins can generate invites
- Invite codes remain valid until family is deleted
- Users cannot join families they're already in
- System shows family preview before joining
- Maximum 20 members per family (enforced)

## Frontend Components to Create
- InviteModal component for generating invites
- JoinFamilyPage for invite code redemption
- InvitePreview component showing family details
- ShareInvite component with copy-to-clipboard

## Definition of Done
- [ ] Invite generation API working
- [ ] Join family API functional
- [ ] Frontend invite flow implemented
- [ ] Invite code validation working
- [ ] Error handling for edge cases complete
- [ ] Family member limits enforced

## Dependencies
- TICKET-004 (Family Management API)

## Files to Create
- `app/api/families/[id]/invite/route.ts`
- `app/api/families/join/[code]/route.ts`
- `app/api/families/join/[code]/info/route.ts`
- `app/join/[code]/page.tsx` - Join family page
- `components/InviteModal.tsx`
- `components/InvitePreview.tsx`

## Notes
- Consider implementing invite expiration in future
- Plan for email invitations in later phases
- Ensure invite URLs work across different domains 