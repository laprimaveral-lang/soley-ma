const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Changing Nginx alias to root for assets/products...');
  conn.exec(`
    # Replace alias with root in /etc/nginx/sites-available/soley
    sed -i 's|alias /var/www/soley/public/assets/products/;|root /var/www/soley/public;|g' /etc/nginx/sites-available/soley
    sed -i 's|alias /var/www/soley/public/assets/products/;|root /var/www/soley/public;|g' /etc/nginx/sites-enabled/soley

    echo "=== Testing Nginx Configuration ==="
    nginx -t
    
    echo "=== Reloading Nginx ==="
    systemctl reload nginx
    echo "Nginx config updated and reloaded successfully!"
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
