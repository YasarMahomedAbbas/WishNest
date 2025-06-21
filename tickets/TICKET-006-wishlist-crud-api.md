# TICKET-006: Wishlist CRUD API

## Metadata
- **Epic**: Phase 3 - Wishlist Core Features
- **Story Points**: 13
- **Priority**: High
- **Type**: Feature
- **Status**: Backlog
- **Sprint**: 3

## User Story
As a **family member**, I want to **create, view, edit, and delete wishlist items** so that **I can maintain my personal wishlist and view other family members' wishlists**.

## Acceptance Criteria
- [ ] Users can create new wishlist items
- [ ] Users can view their own wishlist items
- [ ] Users can view other family members' wishlist items
- [ ] Users can edit their own wishlist items
- [ ] Users can delete their own wishlist items
- [ ] Items include title, description, price, link, category, and priority
- [ ] Price tracking history is maintained
- [ ] Items are properly associated with users and families

## Technical Requirements
- Implement full CRUD operations for wishlist items
- Enforce proper authorization (users can only edit their own items)
- Validate all item data before saving
- Support image URL extraction from product links
- Implement proper error handling and validation
- Use TypeScript for type safety

## API Endpoints to Create
- `GET /api/wishlists/:familyId` - Get all family wishlists
- `GET /api/wishlist-items/:userId` - Get user's wishlist
- `POST /api/wishlist-items` - Create new wishlist item
- `PUT /api/wishlist-items/:id` - Update wishlist item
- `DELETE /api/wishlist-items/:id` - Delete wishlist item
- `GET /api/wishlist-items/:id` - Get single wishlist item

## Data Models
```typescript
interface WishlistItem {
  id: string
  title: string
  description: string
  price: number
  link: string
  imageUrl?: string
  categoryId: string
  userId: string
  familyId: string
  priority: 'low' | 'medium' | 'high'
  status: 'available' | 'reserved' | 'purchased'
  createdAt: Date
  updatedAt: Date
}

interface CreateItemRequest {
  title: string
  description: string
  price: number
  link: string
  categoryId: string
  priority: 'low' | 'medium' | 'high'
}
```

## Business Rules
- Items must belong to a family the user is a member of
- Users can only edit/delete their own items
- Item titles must be 3-100 characters
- Prices must be positive numbers
- Links must be valid URLs
- Categories must exist and belong to the family

## Frontend Integration
- [ ] Replace mock data in main page with real API calls
- [ ] Update add/edit item forms to use API
- [ ] Implement real-time updates after CRUD operations
- [ ] Add loading states for all operations
- [ ] Show proper error messages for validation failures

## Definition of Done
- [ ] All CRUD API endpoints implemented and tested
- [ ] Frontend connected to real API endpoints
- [ ] Data validation working on both frontend and backend
- [ ] Authorization properly enforced
- [ ] Error handling implemented
- [ ] Mock data removed from frontend
- [ ] TypeScript types updated throughout

## Dependencies
- TICKET-001 (Database Schema Setup)
- TICKET-002 (API Infrastructure Setup)
- TICKET-003 (User Authentication System)
- TICKET-004 (Family Management API)

## Files to Create/Modify
- `app/api/wishlists/[familyId]/route.ts`
- `app/api/wishlist-items/route.ts`
- `app/api/wishlist-items/[id]/route.ts`
- `app/api/wishlist-items/user/[userId]/route.ts`
- `lib/wishlist-utils.ts` - Wishlist utilities
- `lib/validations/wishlist.ts` - Wishlist validation schemas
- `app/page.tsx` - Update to use real API
- `types/wishlist.ts` - TypeScript type definitions

## Testing Requirements
- Test all CRUD operations
- Test authorization rules
- Test data validation
- Test error handling
- Test frontend integration

## Notes
- Consider implementing batch operations for multiple items
- Plan for image upload functionality in future tickets
- Ensure proper cascade deletion when families are deleted 