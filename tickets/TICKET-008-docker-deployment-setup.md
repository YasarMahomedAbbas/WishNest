# TICKET-008: Docker Deployment Setup

## Metadata
- **Epic**: Phase 7 - Simple Self-Hosted Deployment
- **Story Points**: 5
- **Priority**: Medium
- **Type**: Technical Task
- **Status**: Backlog
- **Sprint**: 4

## User Story
As a **family admin**, I want to **deploy the application using Docker** so that **I can easily run WishNest on my home server with minimal setup**.

## Acceptance Criteria
- [ ] Dockerfile created for Next.js application
- [ ] Docker Compose configuration includes all services
- [ ] Application runs on port 3000
- [ ] PostgreSQL database runs in separate container
- [ ] Environment variables properly configured
- [ ] Database initialization handled automatically
- [ ] Application accessible on local network

## Technical Requirements
- Use official Node.js base image
- Multi-stage build for production optimization
- PostgreSQL 15 container with persistent storage
- Environment variable management
- Proper container networking
- Health checks for all services

## Docker Configuration
```dockerfile
# Dockerfile structure
FROM node:18-alpine AS base
# Dependencies stage
FROM base AS deps
# Build stage  
FROM base AS builder
# Production stage
FROM base AS runner
```

## Services to Configure
- **app**: Next.js application container
- **db**: PostgreSQL database container
- **redis** (optional): Caching layer

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT secret key
- `NEXTAUTH_URL`: Application URL
- `NODE_ENV`: Production environment

## Definition of Done
- [ ] Dockerfile builds successfully
- [ ] Docker Compose starts all services
- [ ] Application accessible at http://localhost:3000
- [ ] Database persists data between restarts
- [ ] Environment variables properly loaded
- [ ] Services communicate correctly
- [ ] Basic deployment documentation created

## Dependencies
- TICKET-001 (Database Schema Setup)
- TICKET-002 (API Infrastructure Setup)
- TICKET-003 (User Authentication System)

## Files to Create
- `Dockerfile` - Application container definition
- `docker-compose.yml` - Service orchestration
- `.env.example` - Environment variable template
- `scripts/start.sh` - Startup script
- `scripts/stop.sh` - Shutdown script
- `docs/DEPLOYMENT.md` - Deployment instructions

## Docker Compose Structure
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/wishlist
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=wishlist
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Deployment Instructions
1. Clone repository
2. Copy `.env.example` to `.env`
3. Update environment variables
4. Run `docker-compose up -d`
5. Access application at `http://[server-ip]:3000`

## Notes
- Optimize image size for production
- Consider health checks for monitoring
- Plan for easy updates and backups
- Document network access configuration 