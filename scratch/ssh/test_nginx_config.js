const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Testing Nginx configuration');
  conn.exec(`
    echo "=== [1/2] Testing Nginx Config ==="
    nginx -t
    
    echo "=== [2/2] Checking default Nginx config link ==="
    ls -la /etc/nginx/sites-enabled/
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
