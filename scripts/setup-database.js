#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PRISMA_SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');
const ENV_PATH = path.join(__dirname, '../.env.local');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath}`);
}

function updatePrismaSchema(provider) {
  const schemaContent = readFile(PRISMA_SCHEMA_PATH);
  if (!schemaContent) {
    console.error('❌ Could not read prisma/schema.prisma');
    process.exit(1);
  }

  // Update the datasource provider
  const updatedSchema = schemaContent.replace(
    /datasource db \{\s*provider = "[^"]+"\s*url\s*= env\("DATABASE_URL"\)\s*\}/,
    `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`
  );

  // Handle enums based on provider
  if (provider === 'sqlite') {
    // Convert enums to strings for SQLite
    const enumToString = (enumName, values) => {
      const enumPattern = new RegExp(`enum ${enumName} \\{[^}]+\\}`, 'g');
      const comment = `// Note: SQLite doesn't support enums, so we use strings instead
// Valid values for ${enumName.toLowerCase()}: ${values.map(v => `"${v}"`).join(', ')}`;
      
      return updatedSchema.replace(enumPattern, comment);
    };

    let result = updatedSchema;
    result = enumToString('FamilyMemberRole', ['ADMIN', 'MEMBER']);
    result = enumToString('FamilyMemberStatus', ['ACTIVE', 'INACTIVE', 'PENDING']);
    result = enumToString('ItemPriority', ['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
    result = enumToString('ReservationStatus', ['RESERVED', 'PURCHASED', 'CANCELLED']);

    // Update model fields to use strings instead of enums
    result = result.replace(/role\s+FamilyMemberRole\s+@default\(MEMBER\)/g, 'role     String   @default("MEMBER")');
    result = result.replace(/status\s+FamilyMemberStatus\s+@default\(ACTIVE\)/g, 'status   String   @default("ACTIVE")');
    result = result.replace(/priority\s+ItemPriority\s+@default\(MEDIUM\)/g, 'priority    String   @default("MEDIUM")');
    result = result.replace(/status\s+ReservationStatus\s+@default\(RESERVED\)/g, 'status         String   @default("RESERVED")');

    writeFile(PRISMA_SCHEMA_PATH, result);
  } else if (provider === 'postgresql') {
    // Restore enums for PostgreSQL
    const stringToEnum = (fieldName, enumName, defaultValue) => {
      const pattern = new RegExp(`${fieldName}\\s+String\\s+@default\\(["']${defaultValue}["']\\)`, 'g');
      return updatedSchema.replace(pattern, `${fieldName} ${enumName} @default(${defaultValue})`);
    };

    let result = updatedSchema;
    result = stringToEnum('role', 'FamilyMemberRole', 'MEMBER');
    result = stringToEnum('status', 'FamilyMemberStatus', 'ACTIVE');
    result = stringToEnum('priority', 'ItemPriority', 'MEDIUM');
    result = stringToEnum('status', 'ReservationStatus', 'RESERVED');

    // Add enum definitions back
    const enumDefinitions = `
// Enums
enum FamilyMemberRole {
  ADMIN
  MEMBER
}

enum FamilyMemberStatus {
  ACTIVE
  INACTIVE
  PENDING
}

enum ItemPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ReservationStatus {
  RESERVED
  PURCHASED
  CANCELLED
}`;

    // Remove SQLite comments and add enums
    result = result.replace(/\/\/ Note: SQLite doesn't support enums[^}]+}/g, '');
    result = result.replace(/\/\/ Valid values for[^\n]+\n/g, '');
    result += enumDefinitions;

    writeFile(PRISMA_SCHEMA_PATH, result);
  }
}

function updateEnvFile(provider) {
  let envContent = readFile(ENV_PATH) || '';
  
  // Update DATABASE_URL based on provider
  if (provider === 'sqlite') {
    envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./dev.db"');
  } else if (provider === 'postgresql') {
    envContent = envContent.replace(/DATABASE_URL=.*/, 'DATABASE_URL="postgresql://username:password@localhost:5432/wishnest"');
  }

  // Ensure JWT_SECRET exists
  if (!envContent.includes('JWT_SECRET')) {
    envContent += '\nJWT_SECRET="your-super-secret-jwt-key-change-this-in-production"';
  }

  writeFile(ENV_PATH, envContent);
}

function generatePrismaClient(provider) {
  try {
    console.log('🔄 Generating Prisma client...');
    const env = { ...process.env };
    if (provider === 'sqlite') {
      env.DATABASE_URL = 'file:./dev.db';
    }
    execSync('npm run db:generate', { stdio: 'inherit', env });
    console.log('✅ Prisma client generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client');
    process.exit(1);
  }
}

function pushDatabase(provider) {
  try {
    console.log('🔄 Pushing database schema...');
    const env = { ...process.env };
    if (provider === 'sqlite') {
      env.DATABASE_URL = 'file:./dev.db';
    }
    
    // Try migrate deploy first, then fall back to db push
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit', env });
      console.log('✅ Database migrations deployed successfully');
    } catch (migrateError) {
      console.log('ℹ️  No existing migrations found, pushing schema directly...');
      execSync('npm run db:push', { stdio: 'inherit', env });
      console.log('✅ Database schema pushed successfully');
    }
  } catch (error) {
    console.error('❌ Failed to push database schema');
    console.error(error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const provider = args[0];

  if (!provider || !['sqlite', 'postgresql'].includes(provider)) {
    console.log(`
🪺 WishNest Database Setup

Usage: node scripts/setup-database.js <provider>

Providers:
  sqlite      - Use SQLite (file-based, no server required)
  postgresql  - Use PostgreSQL (requires local PostgreSQL server)

Examples:
  node scripts/setup-database.js sqlite
  node scripts/setup-database.js postgresql

Note: For PostgreSQL, make sure you have:
1. PostgreSQL installed and running
2. A database named 'wishnest' created
3. Update the DATABASE_URL in .env.local with your credentials
`);
    process.exit(1);
  }

  console.log(`🔄 Setting up ${provider.toUpperCase()} database...`);

  // Update Prisma schema
  updatePrismaSchema(provider);
  
  // Update environment file
  updateEnvFile(provider);
  
  // Generate Prisma client
  generatePrismaClient(provider);
  
  // Push database schema
  pushDatabase(provider);

  console.log(`
✅ Database setup complete!

Provider: ${provider.toUpperCase()}
Schema: Updated for ${provider}
Environment: Updated .env.local

Next steps:
1. Start the development server: npm run dev
2. Visit: http://localhost:3000 (or 3001 if 3000 is in use)

${provider === 'postgresql' ? `
⚠️  PostgreSQL Setup Required:
1. Make sure PostgreSQL is running
2. Create a database: CREATE DATABASE wishnest;
3. Update DATABASE_URL in .env.local with your credentials
4. Example: DATABASE_URL="postgresql://username:password@localhost:5432/wishnest"
` : ''}
`);
}

if (require.main === module) {
  main();
} 