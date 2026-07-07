const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Getting PM2 logs...');
  conn.exec(`
    pm2 status
    echo "=== LATEST ERROR LOGS ==="
    pm2 logs --err --lines 30 --raw || tail -n 50 ~/.pm2/logs/*.log
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
