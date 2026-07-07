const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Pulling & Building Frontend Pixel Fixes');
  conn.exec(`
    set -e
    cd /var/www/soley
    
    echo "=== [1/2] Pulling git modifications ==="
    git pull origin main
    
    echo "=== [2/2] Rebuilding Frontend ==="
    npm run build
    
    echo "=== Frontend deployment completed successfully! ==="
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
