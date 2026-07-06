const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected');
  conn.exec(`
    cd /var/www/soley
    git fetch origin main
    git reset --hard origin/main
    cd server
    DATABASE_URL="postgresql://soley_user:soley_pass@localhost:5432/soley_db?schema=public" npx tsx seedAll.ts
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write('OUT: ' + data);
    }).stderr.on('data', (data) => {
      process.stdout.write('ERR: ' + data);
    });
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
