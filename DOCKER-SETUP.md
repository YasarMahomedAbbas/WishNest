# 🐳 WishNest Docker Setup Guide

WishNest supports automatic database detection in Docker! The application will automatically use **SQLite** by default, or **PostgreSQL** if you provide the database connection details.

## 🚀 Quick Start

### Option 1: SQLite (Default - No Database Server Required)

```bash
# Clone the repository
git clone https://github.com/YasarAbbas/wishnest.git
cd wishnest

# Start with SQLite (default)
docker-compose up -d

# Access the application
open http://localhost:3000
```

### Option 2: PostgreSQL (Production-Ready)

```bash
# Clone the repository
git clone https://github.com/YasarAbbas/wishnest.git
cd wishnest

# Start with PostgreSQL
docker-compose --profile postgres up -d

# Access the application
open http://localhost:3000
```

## 🔧 Configuration Options

### Environment Variables

Create a `.env` file in your project root:

```env
# Database Configuration
# Leave empty for SQLite, or set PostgreSQL URL
DATABASE_URL=postgresql://wishnest:wishnest123@postgres:5432/wishnest

# PostgreSQL Configuration (only needed if using PostgreSQL)
POSTGRES_DB=wishnest
POSTGRES_USER=wishnest
POSTGRES_PASSWORD=wishnest123

# Application Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
```

### Database Auto-Detection

The application automatically detects your database choice:

| DATABASE_URL | Database Used | Description |
|--------------|---------------|-------------|
| **Not set** | SQLite | Default, no server required |
| `file:...` | SQLite | Explicit SQLite file |
| `postgresql://...` | PostgreSQL | PostgreSQL server |

## 📊 Database Comparison

| Feature | SQLite (Default) | PostgreSQL |
|---------|------------------|------------|
| **Setup** | ⭐ Zero config | ⭐⭐ Docker profile |
| **Performance** | ⭐⭐ Good for small families | ⭐⭐⭐⭐ Excellent |
| **Concurrent Users** | ⭐⭐ Limited | ⭐⭐⭐⭐ Many |
| **Data Persistence** | ⭐⭐⭐ File-based | ⭐⭐⭐⭐ Volume-based |
| **Backup** | ⭐⭐⭐ Copy file | ⭐⭐⭐⭐ Full backup tools |

## 🐳 Docker Commands

### Basic Commands

```bash
# Start with SQLite (default)
docker-compose up -d

# Start with PostgreSQL
docker-compose --profile postgres up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Advanced Commands

```bash
# Build the image
docker-compose build

# Rebuild and start
docker-compose up -d --build

# Access container shell
docker-compose exec wishnest sh

# View database (SQLite)
docker-compose exec wishnest sqlite3 /app/data/wishnest.db

# View database (PostgreSQL)
docker-compose exec postgres psql -U wishnest -d wishnest
```

## 🔄 Switching Between Databases

### From SQLite to PostgreSQL

```bash
# Stop current services
docker-compose down

# Start with PostgreSQL
docker-compose --profile postgres up -d

# The application will automatically:
# 1. Detect PostgreSQL from DATABASE_URL
# 2. Update Prisma schema for PostgreSQL
# 3. Run migrations
# 4. Start the application
```

### From PostgreSQL to SQLite

```bash
# Stop all services
docker-compose down

# Remove PostgreSQL volume (optional)
docker-compose down -v

# Start with SQLite
docker-compose up -d

# The application will automatically:
# 1. Detect no DATABASE_URL (defaults to SQLite)
# 2. Update Prisma schema for SQLite
# 3. Run migrations
# 4. Start the application
```

## 📁 Data Persistence

### SQLite Data
- **Location**: `./data/wishnest.db` (mounted volume)
- **Backup**: Copy the `data/` directory
- **Restore**: Replace the `data/` directory

### PostgreSQL Data
- **Location**: Docker volume `wishnest_postgres_data`
- **Backup**: `docker-compose exec postgres pg_dump -U wishnest wishnest > backup.sql`
- **Restore**: `docker-compose exec -T postgres psql -U wishnest wishnest < backup.sql`

## 🔧 Custom Configuration

### Using External PostgreSQL

If you have an existing PostgreSQL server:

```bash
# Set environment variables
export DATABASE_URL="postgresql://username:password@your-server:5432/wishnest"

# Start without PostgreSQL service
docker-compose up -d wishnest
```

### Custom Ports

```bash
# Start with custom port
docker-compose up -d -p 8080:3000
```

### Production Environment

```bash
# Create production .env file
cat > .env << EOF
DATABASE_URL=postgresql://wishnest:wishnest123@postgres:5432/wishnest
JWT_SECRET=your-production-secret-key-here
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-nextauth-secret
EOF

# Start with PostgreSQL
docker-compose --profile postgres up -d
```

## 🛠️ Troubleshooting

### Common Issues

#### "Connection refused" (PostgreSQL)
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### "Database does not exist"
```bash
# Connect to PostgreSQL and create database
docker-compose exec postgres psql -U wishnest -c "CREATE DATABASE wishnest;"
```

#### "Permission denied" (SQLite)
```bash
# Fix file permissions
docker-compose exec wishnest chown nextjs:nodejs /app/data/wishnest.db
```

#### "Port already in use"
```bash
# Check what's using port 3000
lsof -i :3000

# Use different port
docker-compose up -d -p 8080:3000
```

### Debug Commands

```bash
# View application logs
docker-compose logs wishnest

# View database setup logs
docker-compose logs wishnest | grep "Database"

# Check database connection
docker-compose exec wishnest npx prisma db push --preview-feature

# Access container for debugging
docker-compose exec wishnest sh
```

## 📈 Production Deployment

### Using Docker Compose

```bash
# Create production environment
cp .env.example .env
# Edit .env with production values

# Start with PostgreSQL
docker-compose --profile postgres up -d

# Set up reverse proxy (nginx, traefik, etc.)
# Configure SSL certificates
# Set up monitoring and logging
```

### Using Docker Swarm

```bash
# Deploy to swarm
docker stack deploy -c docker-compose.yml wishnest

# Scale services
docker service scale wishnest_wishnest=3
```

### Using Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=wishnest
```

## 🎯 Recommendation

- **Start with SQLite**: Perfect for small families, zero configuration
- **Use PostgreSQL**: For multiple families or production deployment
- **Both work seamlessly**: The application auto-detects and configures everything

The choice is yours! Both databases will give you a fully functional family wishlist application. 🪺 