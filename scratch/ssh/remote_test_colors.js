const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Testing colors and sizes endpoints');
  conn.exec(`
    echo "=== [1/2] Colors endpoint ==="
    curl -s http://127.0.0.1:3001/api/colors
    
    echo ""
    echo "=== [2/2] Sizes endpoint ==="
    curl -s http://127.0.0.1:3001/api/sizes
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
