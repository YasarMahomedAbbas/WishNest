import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const hashedPassword = await bcrypt.hash('1234', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: {},
    create: {
      email: 'test@test.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: hashedPassword,
      name: 'Alice Johnson',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob Wilson',
    },
  });

  // Create a test family
  const family = await prisma.family.upsert({
    where: { inviteCode: 'FAMILY001' },
    update: {},
    create: {
      name: 'Test Family',
      inviteCode: 'FAMILY001',
      description: 'A test family for development',
    },
  });

  // Add users to family
  await prisma.familyMember.upsert({
    where: {
      userId_familyId: {
        userId: user1.id,
        familyId: family.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      familyId: family.id,
      role: 'ADMIN',
    },
  });

  await prisma.familyMember.upsert({
    where: {
      userId_familyId: {
        userId: user2.id,
        familyId: family.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      familyId: family.id,
      role: 'MEMBER',
    },
  });

  await prisma.familyMember.upsert({
    where: {
      userId_familyId: {
        userId: user3.id,
        familyId: family.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      familyId: family.id,
      role: 'MEMBER',
    },
  });

  // Create default categories
  const defaultCategories = [
    { name: 'Electronics', description: 'Gadgets, devices, and tech accessories' },
    { name: 'Books', description: 'Books, e-books, and reading materials' },
    { name: 'Games', description: 'Video games, board games, and toys' },
    { name: 'Home & Garden', description: 'Home decor, furniture, and garden items' },
    { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
    { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
    { name: 'Health & Beauty', description: 'Skincare, makeup, and health products' },
    { name: 'Other', description: 'Everything else' },
  ];

  const createdCategories: { [key: string]: any } = {};

  for (const category of defaultCategories) {
    const createdCategory = await prisma.category.upsert({
      where: {
        name_familyId: {
          name: category.name,
          familyId: family.id,
        },
      },
      update: {},
      create: {
        name: category.name,
        description: category.description,
        familyId: family.id,
        isDefault: true,
      },
    });
    createdCategories[category.name] = createdCategory;
  }

  // Create wishlist items for users
  const wishlistItems = [
    // User 1 items
    {
      title: 'Wireless Noise-Cancelling Headphones',
      description: 'Perfect for working from home and listening to music',
      price: 299.99,
      productUrl: 'https://example.com/headphones',
      userId: user1.id,
      categoryId: createdCategories['Electronics'].id,
    },
    {
      title: 'JavaScript: The Good Parts',
      description: 'A classic book for improving my JavaScript skills',
      price: 24.99,
      userId: user1.id,
      categoryId: createdCategories['Books'].id,
    },
    {
      title: 'Standing Desk Converter',
      description: 'To improve my workspace ergonomics',
      price: 199.99,
      userId: user1.id,
      categoryId: createdCategories['Home & Garden'].id,
    },
    // Alice's items
    {
      title: 'The Seven Husbands of Evelyn Hugo',
      description: 'Heard great things about this novel!',
      price: 16.99,
      userId: user2.id,
      categoryId: createdCategories['Books'].id,
    },
    {
      title: 'Yoga Mat Premium',
      description: 'For my morning yoga routine',
      price: 49.99,
      userId: user2.id,
      categoryId: createdCategories['Sports & Outdoors'].id,
    },
    {
      title: 'Bluetooth Speaker',
      description: 'For outdoor gatherings and beach trips',
      price: 79.99,
      productUrl: 'https://example.com/speaker',
      userId: user2.id,
      categoryId: createdCategories['Electronics'].id,
    },
    // Bob's items
    {
      title: 'Board Game: Wingspan',
      description: 'Popular strategy game for family game nights',
      price: 59.99,
      userId: user3.id,
      categoryId: createdCategories['Games'].id,
    },
    {
      title: 'Running Shoes',
      description: 'Need new shoes for my marathon training',
      price: 129.99,
      userId: user3.id,
      categoryId: createdCategories['Sports & Outdoors'].id,
    },
    {
      title: 'Coffee Grinder',
      description: 'To make the perfect cup of morning coffee',
      price: 89.99,
      userId: user3.id,
      categoryId: createdCategories['Other'].id,
    },
  ];

  for (const item of wishlistItems) {
    await prisma.wishlistItem.create({
      data: item,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Test users created:`);
  console.log(`   - ${user1.name}: test@test.com (password: 1234)`);
  console.log(`   - ${user2.name}: alice@example.com (password: 1234)`);
  console.log(`   - ${user3.name}: bob@example.com (password: 1234)`);
  console.log(`👨‍👩‍👧‍👦 Test family created: ${family.name} (invite code: ${family.inviteCode})`);
  console.log(`🎁 Created ${wishlistItems.length} wishlist items across all users`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 