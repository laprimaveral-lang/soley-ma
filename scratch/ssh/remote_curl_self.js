const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS - Performing self curl tests');
  conn.exec(`
    echo "=== [1/2] Curl http://127.0.0.1/ ==="
    curl -i http://127.0.0.1/ | head -n 25
    
    echo "=== [2/2] Curl http://31.220.94.217/ ==="
    curl -i http://31.220.94.217/ | head -n 25
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
