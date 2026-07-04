import { PrismaClient } from '@prisma/client';
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

async function main() {
  console.log('Wiping database...');
  
  // Delete all tables in reverse dependency order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  
  await prisma.category.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.color.deleteMany();
  await prisma.size.deleteMany();
  
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.setting.deleteMany();
  
  // We keep the admin user or recreate it
  await prisma.user.deleteMany({ where: { role: 'customer' } });

  console.log('Database wiped successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
