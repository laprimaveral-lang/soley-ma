const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Checking uploads directory...');
  conn.exec(`
echo "=== File list in /var/www/soley/public/assets/products/ ==="
ls -la /var/www/soley/public/assets/products/ || echo "Directory not found"

echo "=== Test Nginx response for IP ==="
curl -I http://31.220.94.217/assets/products/1783507070482-Matte%20beige.png

echo "=== Test Nginx response for domain ==="
curl -I https://soley.ma/assets/products/1783507070482-Matte%20beige.png
  `, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', (code) => {
      console.log('Exit code:', code);
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
