# TICKET-001: Database Schema Setup

## Metadata
- **Epic**: Phase 1 - Backend Foundation & Authentication
- **Story Points**: 8
- **Priority**: High
- **Type**: Technical Task
- **Status**: Backlog
- **Sprint**: 1

## User Story
As a **developer**, I want to **set up the database schema** so that **the application has a solid foundation for storing user data, families, and wishlists**.

## Acceptance Criteria
- [ ] PostgreSQL database is configured locally
- [ ] Prisma ORM is installed and configured
- [ ] Database schema includes all required tables:
  - [ ] Users table with authentication fields
  - [ ] Families table with invite codes
  - [ ] Family_members junction table
  - [ ] Categories table for wishlist organization
  - [ ] Wishlist_items table with all required fields
  - [ ] Item_reservations table for gift coordination
  - [ ] Price_history table for tracking
- [ ] Database migrations run successfully
- [ ] Prisma client generates TypeScript types
- [ ] Database connection can be established from Next.js

## Technical Requirements
- Use PostgreSQL 15+
- Use Prisma ORM for schema management
- Follow proper database normalization
- Include proper indexes for performance
- Add foreign key constraints for data integrity

## Definition of Done
- [ ] Schema file created and documented
- [ ] Initial migration applied successfully
- [ ] Database connection utility created
- [ ] TypeScript types generated
- [ ] Local database accessible from application
- [ ] Schema reviewed and approved

## Dependencies
- None (foundational ticket)

## Notes
- Set up local PostgreSQL instance for development
- Consider using Docker for database consistency
- Ensure schema aligns with README.md feature requirements 