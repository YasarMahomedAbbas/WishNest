# TICKET-007: Item Reservation System

## Metadata
- **Epic**: Phase 3 - Wishlist Core Features
- **Story Points**: 8
- **Priority**: High
- **Type**: Feature
- **Status**: Backlog
- **Sprint**: 3

## User Story
As a **family member**, I want to **reserve wishlist items for purchase** so that **I can coordinate gift-giving without spoiling surprises or causing duplicate purchases**.

## Acceptance Criteria
- [ ] Users can reserve/claim other family members' wishlist items
- [ ] Users cannot see which items are reserved for them
- [ ] Users can view their own reservations
- [ ] Users can unreserve items they've claimed
- [ ] Users can mark reserved items as purchased
- [ ] Items show availability status (available/reserved/purchased)
- [ ] Purchase notes can be added when marking as purchased

## Technical Requirements
- Implement reservation business logic
- Prevent users from reserving their own items
- Hide reservation details from item owners
- Track reservation timestamps and purchase dates
- Support optional purchase notes
- Handle concurrent reservation attempts

## API Endpoints to Create
- `POST /api/wishlist-items/:id/reserve` - Reserve an item
- `DELETE /api/wishlist-items/:id/reserve` - Cancel reservation
- `PUT /api/wishlist-items/:id/purchase` - Mark item as purchased
- `GET /api/reservations/me` - Get user's reservations

## Data Models
```typescript
interface ItemReservation {
  id: string
  itemId: string
  reservedBy: string
  reservedAt: Date
  purchasedAt?: Date
  purchaseNotes?: string
}

interface ReservationRequest {
  itemId: string
}

interface PurchaseRequest {
  itemId: string
  notes?: string
}
```

## Business Rules
- Users cannot reserve their own items
- Users cannot see reservations on their own items
- Only one person can reserve an item at a time
- Reserved items cannot be reserved by others
- Purchased items cannot be unreserved
- Item owners cannot see who reserved their items

## Frontend Integration
- [ ] Update item cards to show reservation status
- [ ] Add reserve/unreserve buttons for eligible items
- [ ] Create "My Reservations" page
- [ ] Add purchase confirmation dialog
- [ ] Hide reservation details from item owners
- [ ] Show appropriate status indicators

## Privacy Implementation
- Item owners see: "Available", "Reserved", "Purchased"
- Other family members see: "Available", "Reserved by You", "Purchased"
- Reservation details (who reserved) hidden from item owners

## Definition of Done
- [ ] All reservation API endpoints working
- [ ] Business logic properly implemented
- [ ] Privacy rules enforced in frontend and backend
- [ ] My Reservations page functional
- [ ] Purchase tracking working
- [ ] Concurrent reservation handling tested
- [ ] Status indicators working correctly

## Dependencies
- TICKET-006 (Wishlist CRUD API)

## Files to Create/Modify
- `app/api/wishlist-items/[id]/reserve/route.ts`
- `app/api/wishlist-items/[id]/purchase/route.ts`
- `app/api/reservations/me/route.ts`
- `app/reservations/page.tsx` - My Reservations page
- `components/ReservationButton.tsx`
- `components/PurchaseDialog.tsx`
- `lib/reservation-utils.ts`
- `app/page.tsx` - Update to show reservation status

## User Flows
1. **Reserve Item**:
   - User browses family member's wishlist
   - User clicks "Reserve" on available item
   - System confirms reservation
   - Item shows as "Reserved" to others, "Reserved by You" to reserver

2. **Purchase Item**:
   - User goes to My Reservations
   - User clicks "Mark as Purchased"
   - User optionally adds purchase notes
   - Item marked as purchased for everyone

3. **Cancel Reservation**:
   - User goes to My Reservations
   - User clicks "Cancel Reservation"
   - Item becomes available again

## Notes
- Consider implementing reservation expiry in future
- Plan for group gift functionality in later phases
- Ensure proper notification system integration points 