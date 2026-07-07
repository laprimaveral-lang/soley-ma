const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to VPS (31.220.94.217)...');
  conn.exec(`
    echo "=== 1. Vérification DNS (dig +short) ==="
    DIG_MAIN=$(dig soley.ma +short | tail -n1)
    DIG_WWW=$(dig www.soley.ma +short | tail -n1)
    
    echo "soley.ma -> $DIG_MAIN"
    echo "www.soley.ma -> $DIG_WWW"
    
    if [ "$DIG_MAIN" = "31.220.94.217" ] && [ "$DIG_WWW" = "31.220.94.217" ]; then
      echo "=== DNS Propagé vers 31.220.94.217 ! Installation de Certbot et SSL ==="
      apt update
      apt install -y certbot python3-certbot-nginx
      certbot --nginx -d soley.ma -d www.soley.ma --non-interactive --agree-tos -m admin@soley.ma --redirect
      echo "=== SSL configuré avec succès ! ==="
    else
      echo "=== Propagation DNS non terminée ==="
      echo "Pour le moment, soley.ma pointe vers [$DIG_MAIN] et www.soley.ma pointe vers [$DIG_WWW]."
      echo "Attendez que les deux pointent vers 31.220.94.217 avant de relancer Certbot."
    fi
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
