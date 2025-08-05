# 🪺 WishNest

A self-hosted family wishlist application that brings gift-giving joy to your household! Allow family members to create and manage wishlists, while others can secretly reserve gifts without spoiling the surprise.

## ✨ Features

### 🏠 Family-Focused Design
- **Multi-User Support**: Each family member has their own account and wishlist
- **Privacy Controls**: Users can't see which items are reserved for them
- **Family Groups**: Organize multiple family units or friend groups

### 🛍️ Wishlist Management
- **Easy Item Addition**: Simply paste links from Amazon, Steam, or any online store
- **Price Tracking**: Monitor price changes and set budget-friendly alerts
- **Rich Details**: Add descriptions, categories, priorities, and notes
- **Image Support**: Automatic image fetching from product links

### 🎯 Smart Filtering & Organization
- **Category Filters**: Browse by electronics, books, games, clothing, etc.
- **Price Range Filters**: Find gifts within your budget
- **Priority Sorting**: See most-wanted items first
- **Search Functionality**: Quickly find specific items

### 🤝 Gift Coordination
- **Item Reservation**: Reserve gifts to avoid duplicate purchases
- **Hidden Reservations**: Maintain surprise while coordinating with family
- **Purchase Tracking**: Mark items as purchased with optional notes
- **Collaborative Features**: Multiple family members can contribute to expensive gifts

## 🚀 Installation Guide

### Prerequisites

Before installing WishNest, ensure you have the following installed on your PC:

2. **Docker** - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
3. **Docker Compose** (usually included with Docker Desktop)

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
# Open terminal/command prompt and run:
git clone https://github.com/YasarMahomedAbbas/wishnest.git
cd wishnest
```

#### 2. Choose Your Installation Method

**Option A: Docker with SQLite (Recommended for most users)**
```bash
# Build and start the application
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Check if it's running
sudo docker-compose ps
```

**Option B: Docker with PostgreSQL (For production/multiple families)**
```bash
# Start with PostgreSQL database
sudo docker-compose --profile postgres up -d

# Check if both containers are running
sudo docker-compose ps
```

#### 3. Access Your Application
- Open your web browser
- Navigate to: **http://localhost:3002**
- Create your admin account and start adding family members!

### Troubleshooting

If you encounter issues:

1. **Check container status:**
   ```bash
   sudo docker-compose ps
   ```

2. **View logs:**
   ```bash
   sudo docker-compose logs wishnest
   ```

3. **Restart if needed:**
   ```bash
   sudo docker-compose down
   sudo docker-compose up -d
   ```

4. **Complete rebuild (if major issues):**
   ```bash
   sudo docker-compose down
   sudo docker-compose build --no-cache
   sudo docker-compose up -d
   ```

### Option 2: Local Development

**Prerequisites**: Node.js 18+ and npm/pnpm

1. **Clone the repository**
   ```bash
   git clone https://github.com/YasarMahomedAbbas/wishnest.git
   cd wishnest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database** (choose one option)

   **Option A: SQLite (Simple - Recommended for development)**
   ```bash
   npm run db:setup-sqlite
   ```

   **Option B: PostgreSQL (Production-ready)**
   ```bash
   # Install PostgreSQL first, then:
   npm run db:setup-postgresql
   # Update .env.local with your PostgreSQL credentials
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Create your family admin account
   - Invite family members via email or share registration links

### Database Options

WishNest supports both **SQLite** and **PostgreSQL**:

- **SQLite**: Perfect for small families, no server required, single file
- **PostgreSQL**: Better for multiple families, production deployment

### Docker Compose Configuration

The included `docker-compose.yml` automatically handles both SQLite and PostgreSQL setups:

```yaml
# Current docker-compose.yml (simplified view)
services:
  wishnest:
    container_name: wishnest
    build: .
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL:-file:./data/wishnest.db}
      - JWT_SECRET=${JWT_SECRET:-your-super-secret-jwt-key-change-this-in-production}
    volumes:  
      - ./data:/app/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB:-wishnest}
      - POSTGRES_USER=${POSTGRES_USER:-wishnest}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-wishnest123}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    profiles:
      - postgres

volumes:
  postgres_data: 
```


### Initial Setup

1. **Create Family Group**: Set up your family name and basic settings
2. **Invite Members**: Send invitation links or emails to family members
3. **Configure Categories**: Customize item categories to match your family's interests
4. **Set Privacy Rules**: Configure who can see what within your family group

## 📱 Usage

### Adding Wishlist Items
1. Navigate to "My Wishlist"
2. Click "Add Item"
3. Paste the product URL or manually enter details
4. Set category, priority, and price
5. Add personal notes or specific preferences

### Browsing Family Wishlists
1. Go to "Family Wishlists"
2. Select a family member
3. Use filters to narrow down options
4. Reserve items you plan to purchase

### Managing Reservations
1. View your reservations in "My Reservations"
2. Mark items as purchased when completed
3. Add gift notes for the recipient
4. Track your gift-giving budget

## 🛠️ Development

### Technology Stack
- **Frontend**: [Framework TBD]
- **Backend**: [Framework TBD]
- **Database**: PostgreSQL
- **Authentication**: JWT-based
- **Containerization**: Docker & Docker Compose

### Local Development Setup
```bash
# Clone repository
git clone https://github.com/YasarMahomedAbbas/wishnest.git
cd wishnest

# Install dependencies
npm install

# Set up development database
docker-compose -f docker-compose.dev.yml up -d

# Run development server
npm run dev
```

### Contributing
We welcome contributions! Please read our contributing guidelines and submit pull requests to help improve WishNest.

## 📋 Roadmap

### Version 1.0 (Current Development)
- [ ] Core wishlist functionality
- [ ] User authentication and family groups
- [ ] Basic reservation system
- [ ] Docker deployment setup

### Version 1.1 (Planned)
- [ ] Mobile-responsive design improvements
- [ ] Email notifications for reservations
- [ ] Price tracking and alerts
- [ ] Gift idea suggestions

### Version 2.0 (Future)
- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics and insights
- [ ] Integration with popular shopping platforms
- [ ] Gift exchange and Secret Santa features

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea for improvement? Please:
1. Check existing issues on GitHub
2. Create a detailed bug report or feature request
3. Include steps to reproduce (for bugs)
4. Provide screenshots when helpful

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ☕ Support the Project

If you find WishNest helpful and would like to support its development, consider buying me a coffee!

[![Buy Me A Coffee](bmc_qr.png)](https://coff.ee/YasarAbbas)

**[☕ Buy me a coffee at coff.ee/YasarAbbas](https://coff.ee/YasarAbbas)**

Your support helps maintain and improve this project for families everywhere! 🎁

---

## 📞 Contact & Community

- **GitHub Issues**: For bug reports and feature requests
- **Email**: [Your email for direct contact]
- **Documentation**: [Link to detailed docs when available]

Made with ❤️ for families who love giving the perfect gifts. 
