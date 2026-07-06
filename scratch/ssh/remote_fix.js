const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(`
    set -e
    cd /var/www/soley
    
    echo "=== Pulling Git ==="
    git fetch origin main
    git reset --hard origin/main
    
    echo "=== Building React App ==="
    npm run build
    
    echo "=== Restarting Nginx ==="
    systemctl restart nginx
    
    echo "Done!"
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
