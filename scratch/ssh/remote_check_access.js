const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Checking Nginx access logs');
  conn.exec(`
    echo "=== [1/2] Last 50 access logs ==="
    tail -n 50 /var/log/nginx/access.log
    
    echo "=== [2/2] Last 20 PM2 soley logs ==="
    pm2 logs soley --lines 20 --nostream
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
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
