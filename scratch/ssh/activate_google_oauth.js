const { Client } = require('ssh2');

const GOOGLE_CLIENT_ID = '1033007501939-jjlfn44to9pq96nk2tk61nlsbgq36jlj.apps.googleusercontent.com';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Configuring Google Client ID...');
  conn.exec(`
    set -e
    cd /var/www/soley

    echo "=== [1/3] Updating .env with Google Client ID ==="
    # Remove existing VITE_GOOGLE_CLIENT_ID if any
    grep -v "VITE_GOOGLE_CLIENT_ID" .env > .env.tmp && mv .env.tmp .env || true
    echo "VITE_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" >> .env
    echo "Google Client ID added to .env"
    grep VITE_GOOGLE_CLIENT_ID .env

    echo "=== [2/3] Rebuilding Frontend with Google Client ID ==="
    export VITE_GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
    npm run build

    echo "=== [3/3] Restarting PM2 ==="
    pm2 restart soley --update-env
    pm2 status

    echo "=== Google OAuth activated successfully! ==="
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
