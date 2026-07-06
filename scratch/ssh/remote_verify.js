const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(`
    set -e
    
    echo "=== 1. Checking Services ==="
    systemctl is-active nginx || echo "Nginx is not active"
    pm2 status || echo "PM2 not found"
    
    echo "=== 2. Checking Nginx Config ==="
    cat /etc/nginx/sites-available/soley
    
    echo "=== 3. Testing Curl ==="
    echo "--- curl http://127.0.0.1 ---"
    curl -s http://127.0.0.1 | head -n 15
    echo "--- curl -I http://127.0.0.1 ---"
    curl -s -I http://127.0.0.1
    echo "--- curl http://31.220.94.217 ---"
    curl -s http://31.220.94.217 | head -n 15
    echo "--- curl -I http://31.220.94.217 ---"
    curl -s -I http://31.220.94.217
    
    echo "=== 4. Logs ==="
    echo "--- Nginx Access Log (Last 10) ---"
    tail -n 10 /var/log/nginx/access.log
    echo "--- Nginx Error Log (Last 10) ---"
    tail -n 10 /var/log/nginx/error.log
    echo "--- PM2 Out Log (Last 10) ---"
    pm2 logs soley --lines 10 --nostream --out
    echo "--- PM2 Error Log (Last 10) ---"
    pm2 logs soley --lines 10 --nostream --err
    
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
