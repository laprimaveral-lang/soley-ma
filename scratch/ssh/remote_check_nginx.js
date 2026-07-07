const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Inspecting Nginx configuration');
  conn.exec(`
    echo "=== [1/3] Active Nginx configurations ==="
    ls -l /etc/nginx/sites-enabled/
    
    echo "=== [2/3] Contents of active configs ==="
    for f in /etc/nginx/sites-enabled/*; do
      echo "--- File: $f ---"
      cat "$f"
    done
    
    echo "=== [3/3] Checking if port 3000 is open and responding locally ==="
    curl -I http://localhost:3000 || echo "Port 3000 is NOT responding"
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
