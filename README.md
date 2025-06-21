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

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system
- Basic understanding of self-hosting applications

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YasarAbbas/wishnest.git
   cd wishnest
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - Create your family admin account
   - Invite family members via email or share registration links

### Docker Compose Configuration

```yaml
# Basic docker-compose.yml example
version: '3.8'
services:
  wishnest:
    image: wishnest:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/wishlist
      - SECRET_KEY=your-secret-key-here
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

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SECRET_KEY` | JWT secret for authentication | Required |
| `SMTP_HOST` | Email server for invitations | Optional |
| `SMTP_PORT` | Email server port | `587` |
| `ADMIN_EMAIL` | Default admin email | Required |

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
git clone https://github.com/YasarAbbas/wishnest.git
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