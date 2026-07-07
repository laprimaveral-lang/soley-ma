const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Starting Deployment & Seeding with correct Prisma generation order');
  conn.exec(`
    set -e
    cd /var/www/soley
    
    echo "=== [1/6] Pulling latest git modifications ==="
    git pull origin main
    
    echo "=== [2/6] Installing dependencies & Building Frontend ==="
    npm install
    npm run build
    
    echo "=== [3/6] Installing backend dependencies & Generating Prisma Client ==="
    cd server
    npm install
    npx prisma generate --schema=prisma/schema.prisma
    
    echo "=== [4/6] Building Backend ==="
    npm run build
    
    echo "=== [5/6] Database Schema Push & Seeding the production database ==="
    npx prisma db push --accept-data-loss --schema=prisma/schema.prisma
    npx tsx seedAll.ts
    
    echo "=== [6/6] Restarting PM2 process ==="
    cd ..
    pm2 restart soley || pm2 start ecosystem.config.js
    pm2 save
    
    echo "=== Deployment & Seeding completed successfully! ==="
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
