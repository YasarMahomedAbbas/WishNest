# 🪺 WishNest Database Setup Guide

WishNest supports both **SQLite** and **PostgreSQL** databases. Choose the option that best fits your needs:

## 🚀 Quick Setup

### Option 1: SQLite (Recommended for Simple Setup)
```bash
# Easy setup - no database server required
npm run db:setup-sqlite
```

### Option 2: PostgreSQL (Recommended for Production)
```bash
# Requires PostgreSQL server
npm run db:setup-postgresql
```

## 📊 Database Comparison

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| **Setup Complexity** | ⭐ Simple | ⭐⭐⭐ Requires server |
| **Performance** | ⭐⭐ Good for small families | ⭐⭐⭐⭐ Excellent |
| **Concurrent Users** | ⭐⭐ Limited | ⭐⭐⭐⭐ Many |
| **Data Integrity** | ⭐⭐ Basic | ⭐⭐⭐⭐ Advanced |
| **Backup** | ⭐⭐⭐ Single file | ⭐⭐⭐⭐ Full backup tools |
| **Production Ready** | ⭐⭐ Small scale | ⭐⭐⭐⭐ Enterprise |

## 🗄️ SQLite Setup (Recommended for Development)

**Perfect for:** Small families, personal use, development, simple self-hosting

### Advantages:
- ✅ No database server installation required
- ✅ Single file database (easy backup)
- ✅ Works out of the box
- ✅ Perfect for small families (1-10 users)

### Setup:
```bash
# 1. Setup SQLite database
npm run db:setup-sqlite

# 2. Start development server
npm run dev

# 3. Visit the app
open http://localhost:3000
```

### Database File:
- **Location**: `prisma/dev.db`
- **Backup**: Simply copy the file
- **Size**: ~100KB initially

---

## 🐘 PostgreSQL Setup (Recommended for Production)

**Perfect for:** Multiple families, production deployment, high concurrency

### Prerequisites:
1. **Install PostgreSQL** on your system
2. **Create a database** named `wishnest`
3. **Note your credentials** (username, password, port)

### Installation by OS:

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (with Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### Windows:
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Database Setup:
```bash
# 1. Connect to PostgreSQL
sudo -u postgres psql

# 2. Create database and user
CREATE DATABASE wishnest;
CREATE USER wishnest_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE wishnest TO wishnest_user;
\q

# 3. Setup WishNest with PostgreSQL
npm run db:setup-postgresql

# 4. Update .env.local with your credentials
# DATABASE_URL="postgresql://wishnest_user:your_password@localhost:5432/wishnest"

# 5. Start development server
npm run dev
```

### Environment Configuration:
Update `.env.local` with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/wishnest"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

---

## 🔄 Switching Between Databases

### From SQLite to PostgreSQL:
```bash
# 1. Setup PostgreSQL (see above)
npm run db:setup-postgresql

# 2. Update .env.local with your PostgreSQL URL
# 3. Restart the development server
npm run dev
```

### From PostgreSQL to SQLite:
```bash
# 1. Switch to SQLite
npm run db:setup-sqlite

# 2. Restart the development server
npm run dev
```

---

## 🛠️ Manual Setup (Advanced)

If you prefer manual setup, you can use the script directly:

```bash
# SQLite
node scripts/setup-database.js sqlite

# PostgreSQL
node scripts/setup-database.js postgresql
```

### What the script does:
1. **Updates Prisma schema** for the chosen database
2. **Handles enums** (SQLite doesn't support them)
3. **Updates environment variables**
4. **Generates Prisma client**
5. **Pushes database schema**

---

## 🔧 Troubleshooting

### SQLite Issues:
```bash
# Reset SQLite database
rm prisma/dev.db
npm run db:setup-sqlite
```

### PostgreSQL Issues:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U username -d wishnest
```

### Common Errors:

#### "Connection refused" (PostgreSQL):
- PostgreSQL not running: `sudo systemctl start postgresql`
- Wrong port: Check if PostgreSQL runs on port 5432
- Wrong credentials: Verify username/password in `.env.local`

#### "Database does not exist":
```sql
-- Connect as postgres user
sudo -u postgres psql
CREATE DATABASE wishnest;
\q
```

#### "Permission denied":
```sql
-- Grant permissions
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE wishnest TO your_username;
\q
```

---

## 📈 Production Considerations

### For SQLite:
- **Backup strategy**: Regular file copies
- **Scaling**: Limited to single server
- **Monitoring**: File size and performance

### For PostgreSQL:
- **Backup strategy**: Automated pg_dump
- **Scaling**: Can handle multiple servers
- **Monitoring**: Built-in monitoring tools

---

## 🎯 Recommendation

- **Start with SQLite** if you're new to databases or have a small family
- **Use PostgreSQL** if you plan to have multiple families or deploy to production
- **Both work perfectly** for the core WishNest features

The choice is yours! Both databases will give you a fully functional family wishlist application. 🪺 