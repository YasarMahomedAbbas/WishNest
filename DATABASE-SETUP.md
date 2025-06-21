# Database Setup Guide

This guide will help you set up the PostgreSQL database for the WishNest application locally.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- pnpm package manager (or npm/yarn)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL Database

Using Docker Compose (recommended):

```bash
docker-compose up -d postgres
```

This will start a PostgreSQL database with:
- **Host**: localhost
- **Port**: 5432
- **Database**: wishnest
- **Username**: wishnest
- **Password**: wishnest123

### 3. Set Environment Variables

Create a `.env.local` file in your project root:

```bash
# Database
DATABASE_URL="postgresql://wishnest:wishnest123@localhost:5432/wishnest?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this-in-production"
```

### 4. Generate Prisma Client

```bash
pnpm db:generate
```

### 5. Run Database Migrations

```bash
pnpm db:migrate
```

### 6. Seed the Database (Optional)

```bash
pnpm db:seed
```

This will create:
- A test user: `test@example.com` (password: `password123`)
- A test family with invite code: `FAMILY001`
- Default wishlist categories

### 7. Start the Development Server

```bash
pnpm dev
```

## Database Schema Overview

### Core Tables

1. **users** - User accounts with authentication
2. **families** - Family groups with invite codes
3. **family_members** - Junction table linking users to families
4. **categories** - Wishlist item categories per family
5. **wishlist_items** - Individual wishlist items
6. **item_reservations** - Gift reservations (secret from item owners)
7. **price_history** - Historical price tracking

### Key Relationships

- Users can belong to multiple families
- Each family has customizable categories
- Items belong to users and categories
- Reservations are secret (privacy protection)
- Only one reservation per item allowed

## Database Management Commands

```bash
# Generate Prisma client
pnpm db:generate

# Create and run migrations
pnpm db:migrate

# Push schema changes without migrations (dev only)
pnpm db:push

# Open Prisma Studio (database GUI)
pnpm db:studio

# Seed database with test data
pnpm db:seed
```

## Alternative Setup (Without Docker)

If you prefer to install PostgreSQL locally:

### 1. Install PostgreSQL

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Use default port 5432

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE wishnest;
CREATE USER wishnest WITH PASSWORD 'wishnest123';
GRANT ALL PRIVILEGES ON DATABASE wishnest TO wishnest;
\q
```

### 3. Update Environment Variables

Update your `.env.local` with your local PostgreSQL credentials:

```bash
DATABASE_URL="postgresql://wishnest:wishnest123@localhost:5432/wishnest?schema=public"
```

## Troubleshooting

### Database Connection Issues

1. **Docker not running**:
   ```bash
   docker-compose ps
   # Should show postgres container as "Up"
   ```

2. **Port already in use**:
   ```bash
   # Check what's using port 5432
   lsof -i :5432
   # Stop any existing PostgreSQL services
   ```

3. **Migration errors**:
   ```bash
   # Reset database (caution: deletes all data)
   pnpm db:push --force-reset
   ```

### Common Commands

```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs postgres

# Connect to database directly
docker exec -it wishnest-postgres psql -U wishnest -d wishnest

# Backup database
docker exec wishnest-postgres pg_dump -U wishnest wishnest > backup.sql

# Restore database
docker exec -i wishnest-postgres psql -U wishnest -d wishnest < backup.sql
```

## Database Schema Details

### Privacy & Security Features

- **Password hashing**: User passwords are hashed with bcrypt
- **Secret reservations**: Item owners cannot see who reserved their items
- **Unique constraints**: Prevent duplicate family memberships and reservations
- **Cascade deletes**: Proper cleanup when users/families are removed

### Performance Optimizations

- **Indexes**: Automatic indexes on foreign keys and unique constraints
- **Efficient queries**: Schema designed for common query patterns
- **Minimal joins**: Denormalized where appropriate for performance

### Data Integrity

- **Foreign key constraints**: Ensure referential integrity
- **Enum types**: Constrain values to valid options
- **Required fields**: Non-nullable fields where business logic requires
- **Unique constraints**: Prevent duplicate data where needed

## Next Steps

Once the database is set up:

1. **Run the application**: `pnpm dev`
2. **Open Prisma Studio**: `pnpm db:studio` (view/edit data)
3. **Test with seed data**: Login with `test@example.com` / `password123`
4. **Build authentication**: Implement JWT-based auth system
5. **Create API routes**: Build REST endpoints for the application

The database is now ready to support the WishNest application's core functionality! 