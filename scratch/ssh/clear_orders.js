const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Creating clear script on VPS...');
  
  const scriptContent = `
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ 
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function clean() {
  console.log('Cleaning database tables...');
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlist.deleteMany({});
  console.log('Database relations cleared successfully!');
}

clean()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
`;

  // Write content to clear_db_temp.ts using base64 to avoid quote issues
  const base64Content = Buffer.from(scriptContent).toString('base64');

  conn.exec(`
    cd /var/www/soley/server
    echo "${base64Content}" | base64 -d > clear_db_temp.ts
    echo "=== Running database clear script ==="
    npx tsx clear_db_temp.ts
    rm clear_db_temp.ts
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('SSH connection closed. Exit code:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
