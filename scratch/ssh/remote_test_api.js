const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Testing API outputs on VPS');
  conn.exec(`
    echo "=== [1/2] Categories endpoint output ==="
    curl -s http://127.0.0.1:3001/api/categories | head -n 30
    
    echo ""
    echo "=== [2/2] Products endpoint output ==="
    curl -s http://127.0.0.1:3001/api/products | head -n 30
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
