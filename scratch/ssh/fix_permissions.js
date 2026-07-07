const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Creating upload directory and setting permissions...');
  conn.exec(`
    echo "=== [1/2] Creating directory assets/products ==="
    mkdir -p /var/www/soley/public/assets/products
    
    echo "=== [2/2] Adjusting ownership and permissions ==="
    chown -R www-data:www-data /var/www/soley/public
    chmod -R 755 /var/www/soley/public
    
    echo "Permissions updated successfully!"
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
