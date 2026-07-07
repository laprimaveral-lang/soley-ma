const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Testing Nginx read access');
  conn.exec(`
    echo "=== testing if www-data can read index.html ==="
    sudo -u www-data head -n 5 /var/www/soley/dist/index.html || echo "READ FAILED"
    
    echo "=== testing if www-data can access /var/www/soley/dist ==="
    sudo -u www-data ls -la /var/www/soley/dist || echo "ACCESS FAILED"
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
