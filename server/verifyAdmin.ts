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

async function verifyAndSeed() {
  const users = await prisma.user.findMany();
  console.log('All users in DB:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));

  const targetEmail = 'laprimaveral@gmail.com';
  const targetPassword = 'B@51275ua';

  const existingAdmin = await prisma.user.findUnique({ where: { email: targetEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(targetPassword, 10);
    await prisma.user.create({
      data: {
        name: 'Administrator',
        email: targetEmail,
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log(`Created admin account for ${targetEmail}`);
  } else {
    // Ensure the password and role are correct
    const hashedPassword = await bcrypt.hash(targetPassword, 10);
    await prisma.user.update({
      where: { email: targetEmail },
      data: { password: hashedPassword, role: 'admin' }
    });
    console.log(`Updated admin account for ${targetEmail} to ensure correct credentials.`);
  }

  // Remove the old 'admin@soley.ma' if it exists to be clean
  const oldAdmin = await prisma.user.findUnique({ where: { email: 'admin@soley.ma' } });
  if (oldAdmin) {
    await prisma.user.delete({ where: { email: 'admin@soley.ma' } });
    console.log('Deleted old default admin account admin@soley.ma');
  }
}

verifyAndSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
