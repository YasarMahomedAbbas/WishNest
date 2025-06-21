import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
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

  // Add user to family as admin
  await prisma.familyMember.upsert({
    where: {
      userId_familyId: {
        userId: user.id,
        familyId: family.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      familyId: family.id,
      role: 'ADMIN',
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

  for (const category of defaultCategories) {
    await prisma.category.upsert({
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
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Test user created: test@example.com (password: password123)`);
  console.log(`👨‍👩‍👧‍👦 Test family created: ${family.name} (invite code: ${family.inviteCode})`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 