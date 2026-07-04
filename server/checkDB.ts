import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/soley';
const pool = new Pool({ connectionString, ssl: true });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function check() {
  const categories = await prisma.category.findMany();
  console.log('Categories:', categories);
  const products = await prisma.product.findMany({ include: { category: true } });
  console.log('Products:', products.map(p => ({ id: p.id, name: p.name, categorySlug: p.category?.slug })));
}

check().catch(console.error).finally(() => process.exit(0));
