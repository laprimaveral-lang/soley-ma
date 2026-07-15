const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Deploying Google OAuth...');
  conn.exec(`
    set -e
    cd /var/www/soley

    echo "=== [1/5] Pulling git changes ==="
    git pull origin main

    echo "=== [2/5] Rebuilding Frontend ==="
    npm run build

    echo "=== [3/5] Updating DB schema (adding googleId, avatar) ==="
    cd server
    npx prisma db push --accept-data-loss

    echo "=== [4/5] Rebuilding Backend ==="
    npx prisma generate
    npm run build
    cd ..

    echo "=== [5/5] Restarting PM2 ==="
    pm2 restart soley --update-env
    pm2 status

    echo "=== Deployment completed successfully! ==="
  `, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', (code) => {
      console.log('SSH connection closed. Exit code:', code);
      conn.end();
    });
    stream.on('data', (data) => process.stdout.write(data));
    stream.stderr.on('data', (data) => process.stderr.write(data));
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
