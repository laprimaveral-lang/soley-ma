const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Checking file permissions');
  conn.exec(`
    echo "=== [1/4] Directory listings of /var/www/soley/dist ==="
    ls -la /var/www/soley/dist || echo "Cannot list /var/www/soley/dist"
    
    echo "=== [2/4] Directory permissions ==="
    ls -ld /var/www /var/www/soley /var/www/soley/dist
    
    echo "=== [3/4] Check Nginx user ==="
    ps aux | grep nginx
    
    echo "=== [4/4] Nginx error logs ==="
    tail -n 30 /var/log/nginx/error.log
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
