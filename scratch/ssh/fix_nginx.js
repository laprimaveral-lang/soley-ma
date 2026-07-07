const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Cleaning up backup files and testing Nginx...');
  conn.exec(`
    # Remove backup files from sites-enabled and sites-available
    rm -f /etc/nginx/sites-enabled/*.bak
    rm -f /etc/nginx/sites-available/*.bak

    echo "=== Testing Nginx Configuration ==="
    nginx -t
    
    echo "=== Reloading Nginx ==="
    systemctl reload nginx || systemctl restart nginx
    echo "Nginx updated and reloaded successfully!"
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
