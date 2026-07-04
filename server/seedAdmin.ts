import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ 
  connectionString,
  ssl: true
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  console.log('Checking for admin account...');
  const adminEmail = 'admin@soley.ma';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log('Created default admin account.');
  } else {
    // Force reset the password to admin123 just in case
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashedPassword, role: 'admin' }
    });
    console.log('Reset existing admin account to default credentials.');
  }
}

seedAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
