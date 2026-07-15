require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkUser() {
  const user = await prisma.user.findUnique({ where: { email: 'laprimaveral@gmail.com' } });
  console.log(user);
  if (!user) {
     const hash = await bcrypt.hash('B@51275ua', 10);
     const newUser = await prisma.user.create({ data: { email: 'laprimaveral@gmail.com', password: hash, role: 'admin', name: 'Admin', phone: '0661119678' } });
     console.log('User created', newUser);
  } else {
     const hash = await bcrypt.hash('B@51275ua', 10);
     await prisma.user.update({ where: { email: 'laprimaveral@gmail.com' }, data: { password: hash } });
     console.log('Password updated');
  }
}
checkUser().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
