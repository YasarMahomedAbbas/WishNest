# WishNest Application Reference

## What is WishNest?

WishNest is a **self-hosted family wishlist application** designed to bring joy and coordination to gift-giving within families. It allows family members to create and manage personal wishlists while enabling others to secretly reserve gifts without spoiling surprises.

## Core Problem Being Solved

**Traditional gift-giving challenges:**
- Duplicate gifts purchased by multiple family members
- Difficulty knowing what someone actually wants
- Awkward questions that spoil surprises
- No coordination between gift-givers
- Lost or forgotten gift ideas

**WishNest solution:**
- Centralized family wishlists everyone can see
- Secret reservation system prevents duplicates
- No surprise spoiling (item owners can't see who reserved items)
- Easy coordination between family members
- Persistent storage of gift ideas and purchase history

## Key User Personas

### Family Admin
- **Who**: Usually a parent or tech-savvy family member
- **Goals**: Set up the family, invite members, manage settings
- **Permissions**: Create families, invite members, manage family settings, remove members
- **Typical actions**: Initial setup, sending invite links, managing family disputes

### Family Member
- **Who**: Any family member (parents, children, relatives)
- **Goals**: Maintain personal wishlist, find gifts for others, coordinate purchases
- **Permissions**: Add/edit own items, view others' wishlists, reserve items, mark purchases
- **Typical actions**: Adding wishlist items, browsing family wishlists, reserving gifts

## Core Functionality Overview

### 1. Family Management
- **Family Groups**: Users can belong to multiple families (extended family, friends, etc.)
- **Invite System**: Simple invite codes/links for joining families
- **Member Roles**: Admin (full control) vs Member (standard access)
- **Family Settings**: Customizable categories, family name, member management

### 2. Wishlist Management
- **Personal Wishlists**: Each user maintains their own wishlist
- **Item Details**: Title, description, price, product link, category, priority
- **Rich Information**: Auto-extracted product images and details from URLs
- **Organization**: Categories, priorities, price ranges, search functionality

### 3. Gift Coordination System
- **Secret Reservations**: Reserve items without alerting the item owner
- **Purchase Tracking**: Mark items as purchased with optional notes
- **Status Visibility**: Different views for item owners vs other family members
- **Duplicate Prevention**: Only one person can reserve an item at a time

### 4. Privacy & Surprise Protection
- **Hidden Reservations**: Item owners never see who reserved their items
- **Status Indicators**: "Available" / "Reserved" / "Purchased" (without names)
- **My Reservations**: Private view of items you've reserved
- **Purchase Notes**: Private notes for gift-givers

## User Workflows

### Initial Setup (Family Admin)
1. Register account and create family
2. Generate invite code/link
3. Share invite with family members
4. Set up family categories and settings

### Joining a Family (New Member)
1. Receive invite link from family admin
2. Click link and see family preview
3. Register account or login
4. Confirm joining family

### Adding Wishlist Items (Any Member)
1. Navigate to "My Wishlist"
2. Click "Add Item"
3. Paste product URL or manually enter details
4. Set category, priority, price
5. Add personal notes or preferences
6. Save item to wishlist

### Gift Shopping (Any Member)
1. Browse family member wishlists
2. Use filters (price, category, priority) to find suitable gifts
3. Click "Reserve" on desired item
4. Item becomes "Reserved" for others, "Reserved by You" for you
5. Purchase gift in real life
6. Mark as "Purchased" in app with optional notes

### Managing Purchases (Gift Giver)
1. Go to "My Reservations" page
2. See all items you've reserved
3. Mark items as purchased when complete
4. Add gift notes for recipient
5. Track your gift-giving budget

## Business Rules & Logic

### Family Management
- Users can belong to multiple families
- Each family must have at least one admin
- Maximum 20 members per family
- Family creators automatically become admins
- Admins can remove members but not other admins

### Wishlist Items
- Users can only edit/delete their own items
- Items must belong to a family the user is in
- All items are visible to family members
- Price must be positive number
- Links must be valid URLs if provided

### Reservations & Privacy
- Users cannot reserve their own items
- Only one reservation per item allowed
- Item owners cannot see reservation details
- Reserved items cannot be reserved by others
- Purchased items cannot be unreserved
- Purchase notes are private to the purchaser

### Categories
- Each family can customize their categories
- Default categories: Electronics, Books, Games, Home, Fashion, Sports, Other
- Items must have a valid category
- Categories can be added/edited by family admins

## Technical Context

### Architecture
- **Frontend**: Next.js with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes (full-stack approach)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with httpOnly cookies
- **Deployment**: Docker Compose for simple self-hosting

### Data Relationships
```
Users ←→ FamilyMembers ←→ Families
Users → WishlistItems ← Categories
WishlistItems ← ItemReservations → Users
WishlistItems ← PriceHistory
```

### Security Considerations
- Password hashing with bcrypt
- JWT tokens for session management
- Input validation and sanitization
- Rate limiting on authentication endpoints
- CORS configuration for API access
- Authorization middleware for protected routes

## Common Edge Cases to Handle

### Family Management
- What happens when the last admin leaves a family?
- How to handle family deletion with existing items?
- Preventing users from joining the same family twice
- Handling invalid or expired invite codes

### Wishlist Items
- What happens to reservations when items are deleted?
- Handling concurrent reservation attempts
- Managing items when users leave families
- Dealing with invalid product URLs

### Reservations
- What if someone tries to reserve an already reserved item?
- How to handle reservation conflicts during concurrent access?
- Managing reservations when family members are removed
- Handling edge case of self-reservation attempts

## Success Metrics

### User Engagement
- Number of active families using the system
- Average items per user wishlist
- Reservation-to-purchase conversion rate
- Family member participation rate

### System Health
- API response times under 500ms
- Database query performance
- Error rates below 1%
- Successful deployment and updates

## Future Enhancement Opportunities

### Phase 4+ Features
- Price tracking and alerts
- Group gifts (multiple contributors)
- Gift suggestions based on preferences
- Import from Amazon/other platforms
- Email notifications for key events

### Advanced Features
- Mobile app development
- Social features (comments, likes)
- Gift exchange/Secret Santa functionality
- Multi-language support
- Advanced analytics and insights

## Development Philosophy

### Self-Hosting Focus
- Simple deployment with Docker Compose
- Minimal external dependencies
- Local network operation (no internet required)
- Easy backup and maintenance procedures

### Family-First Design
- Privacy protection is paramount
- Simple, intuitive user interface
- Graceful handling of non-tech-savvy users
- Focus on joy and surprise in gift-giving

### Maintainable Codebase
- TypeScript for type safety
- Clear separation of concerns
- Comprehensive error handling
- Thorough testing coverage
- Documentation for future developers

---

## Quick Reference for Developers

**When implementing tickets, remember:**
- Always enforce authorization (users can only modify their own data)
- Implement proper error handling with user-friendly messages
- Use TypeScript types consistently throughout
- Follow the privacy rules (no reservation details to item owners)
- Validate all inputs on both frontend and backend
- Consider the self-hosting context (local network, Docker deployment)
- Keep the family-focused, joy-oriented user experience in mind

This reference should provide context for any missing details in the individual tickets. 