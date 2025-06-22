# TICKET-001: Database Schema Setup - TODO

## ✅ Completed Tasks

- [x] PostgreSQL database configuration
- [x] Prisma ORM installation and setup
- [x] Database schema design with all required tables:
  - [x] Users table with authentication fields
  - [x] Families table with invite codes
  - [x] Family_members junction table
  - [x] Categories table for wishlist organization
  - [x] Wishlist_items table with all required fields
  - [x] Item_reservations table for gift coordination
  - [x] Price_history table for tracking
- [x] Database connection utility created (`lib/db.ts`)
- [x] Prisma client TypeScript types generated
- [x] Docker Compose setup for local development
- [x] Database seed file with test data
- [x] Comprehensive setup documentation

## 🔄 In Progress

- [ ] Database migrations testing in different environments
- [ ] Performance optimization and indexing review

## 🚀 Steps to Run Database Locally

### Option 1: Using Docker (Recommended)
```bash
# 1. Start PostgreSQL container
docker-compose up -d postgres

# 2. Install dependencies
pnpm install

# 3. Generate Prisma client
pnpm db:generate

# 4. Run migrations
pnpm db:migrate

# 5. Seed database (optional)
pnpm db:seed

# 6. Start development server
pnpm dev
```

### Option 2: Native Windows PostgreSQL
```bash
# 1. Install PostgreSQL from https://www.postgresql.org/download/windows/
# 2. Create database and user:
psql -U postgres -h localhost
CREATE DATABASE wishnest;
CREATE USER wishnest WITH PASSWORD 'wishnest123';
GRANT ALL PRIVILEGES ON DATABASE wishnest TO wishnest;
\q

# 3. Create .env file with:
DATABASE_URL="postgresql://wishnest:wishnest123@localhost:5432/wishnest?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"

# 3.1. Grant permissions to wishnest user:
psql -U postgres -h localhost -c "ALTER USER wishnest CREATEDB;"
psql -U postgres -h localhost -d wishnest -c "GRANT ALL ON SCHEMA public TO wishnest;"

# 4. Install dependencies and setup
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### 🔧 Useful Database Commands
```bash
# View database in browser
pnpm db:studio

# Reset database (caution: deletes all data)
pnpm db:push --force-reset

# Check Docker container status
docker-compose ps

# View database logs
docker-compose logs postgres
```

### 🪟 Windows-Specific Notes
```bash
# For Windows users - if you get environment variable errors:
# 1. Use .env instead of .env.local (more reliable)
# 2. Set PostgreSQL permissions properly:
psql -U postgres -h localhost -c "ALTER USER wishnest CREATEDB;"
psql -U postgres -h localhost -d wishnest -c "GRANT ALL ON SCHEMA public TO wishnest;"

# 3. If Prisma Studio shows empty tables, restart it:
taskkill /f /im node.exe
pnpm db:studio
```

## 🐛 Issues/Notes

- ✅ **RESOLVED**: `PrismaClient` import error - Fixed by running `pnpm db:generate`
- ✅ **RESOLVED**: TypeScript language server needed restart to recognize generated types
- ✅ **RESOLVED**: Environment variable `DATABASE_URL` not found - Fixed by using `.env` instead of `.env.local`
- ✅ **RESOLVED**: Permission denied errors on PostgreSQL - Fixed by granting CREATEDB and schema permissions
- ✅ **RESOLVED**: Prisma Studio not loading data - Fixed by restarting with proper `.env` file
- ✅ **RESOLVED**: Database seed not working - Fixed by setting environment variables before seeding

## 🧪 Testing Checklist

- [x] Prisma client generation works
- [x] Database connection successful
- [x] Seed script runs without errors
- [x] All relationships properly configured
- [x] Prisma Studio access with data visible
- [x] Environment variable loading (`.env` file)
- [x] Database permissions properly configured
- [ ] Migration rollback testing
- [ ] Data integrity constraint testing
- [ ] Performance testing with sample data

## 📊 Database Schema Summary

**Tables Created:** 7
- users (authentication)
- families (groups)  
- family_members (junction)
- categories (organization)
- wishlist_items (core data)
- item_reservations (privacy system)
- price_history (tracking)

**Key Features:**
- Multi-family support
- Secret reservation system
- Role-based access (Admin/Member)
- Price tracking capability
- Proper foreign key constraints
- Privacy protection built-in

## ✅ Definition of Done - TICKET-001

All acceptance criteria have been met:
- [x] PostgreSQL database configured locally
- [x] Prisma ORM installed and configured  
- [x] Database schema includes all required tables
- [x] Database migrations run successfully
- [x] Prisma client generates TypeScript types
- [x] Database connection established from Next.js
- [x] Schema file created and documented
- [x] Initial migration applied successfully
- [x] Local database accessible from application
- [x] Schema reviewed and approved

**Status: ✅ COMPLETE**
**Ready for:** TICKET-002 (API Infrastructure Setup) 