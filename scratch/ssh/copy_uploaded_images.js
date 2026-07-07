const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Copying existing uploaded files and adjusting permissions...');
  conn.exec(`
    echo "=== [1/2] Copying images ==="
    cp -n /var/www/soley/server/public/assets/products/* /var/www/soley/public/assets/products/ || echo "No files to copy"
    
    echo "=== [2/2] Adjusting ownership and permissions ==="
    chown -R www-data:www-data /var/www/soley/public
    chmod -R 755 /var/www/soley/public
    
    echo "Files copied and permissions adjusted successfully!"
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
