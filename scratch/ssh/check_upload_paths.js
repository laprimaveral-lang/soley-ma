const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Checking where files are written...');
  conn.exec(`
    echo "=== Files in /var/www/soley/public/assets/products/ ==="
    ls -la /var/www/soley/public/assets/products/ || echo "Folder /var/www/soley/public/assets/products/ does not exist"
    
    echo "=== Files in /var/www/soley/server/public/assets/products/ ==="
    ls -la /var/www/soley/server/public/assets/products/ || echo "Folder /var/www/soley/server/public/assets/products/ does not exist"
    
    echo "=== Files in /var/www/soley/server/dist/../public/assets/products/ ==="
    ls -la /var/www/soley/server/dist/../public/assets/products/ || echo "Folder /var/www/soley/server/dist/../public/assets/products/ does not exist"
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
