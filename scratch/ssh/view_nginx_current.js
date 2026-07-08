const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Patching Nginx no-cache for index.html...');
  conn.exec(`
cat /etc/nginx/sites-available/soley
`, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    let output = '';
    stream.on('close', (code) => {
      console.log('Current nginx config:');
      console.log(output);
      conn.end();
    });
    stream.on('data', (data) => { output += data; });
    stream.stderr.on('data', (data) => process.stderr.write(data));
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
