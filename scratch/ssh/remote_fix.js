const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Deploying full production build');
  conn.exec(`
    set -e
    cd /var/www/soley
    
    echo "=== [1/5] Pulling latest code ==="
    git fetch origin main
    git reset --hard origin/main
    
    echo "=== [2/5] Building frontend ==="
    npm install
    npm run build
    
    echo "=== [3/5] Building backend + installing security packages ==="
    cd server
    npm install
    npm run build
    
    echo "=== [4/5] Restarting PM2 with updated env ==="
    pm2 restart soley --update-env
    
    echo "=== [5/5] Reloading Nginx ==="
    nginx -t
    systemctl reload nginx
    
    echo "=== Final verification ==="
    sleep 2
    
    echo "--- Site HTML ---"
    curl -s -I http://127.0.0.1 | head -15
    
    echo "--- API ---"
    curl -s -I http://127.0.0.1/api/products
    
    echo "--- robots.txt ---"
    curl -s http://127.0.0.1/robots.txt
    
    echo "--- sitemap.xml check ---"
    curl -s -I http://127.0.0.1/sitemap.xml | grep -E 'HTTP|Content-Type'
    
    echo "=== PM2 STATUS ==="
    pm2 status
    
    echo "=== DEPLOYMENT COMPLETE ==="
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Done. Code:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write('OUT: ' + data);
    }).stderr.on('data', (data) => {
      process.stdout.write('ERR: ' + data);
    });
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
