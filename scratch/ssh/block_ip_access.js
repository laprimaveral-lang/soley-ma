const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Blocking direct IP access...');
  conn.exec(`
# Patch the default server block (port 80, default_server) to return 444 on direct IP access
# This prevents caching issues when accessing via IP instead of domain

cat > /tmp/patch_nginx.py << 'PYEOF'
config_path = '/etc/nginx/sites-available/soley'

with open(config_path, 'r') as f:
    content = f.read()

# Replace the first server block (default_server on port 80) to redirect to soley.ma
old_block = """server {
    client_max_body_size 20M;
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;"""

new_block = """server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    # Block direct IP access - redirect to domain
    return 301 https://soley.ma$request_uri;
}

server {
    client_max_body_size 20M;
    listen 80;
    listen [::]:80;
    server_name soley.ma www.soley.ma;"""

if old_block in content and new_block not in content:
    content = content.replace(old_block, new_block, 1)
    with open(config_path, 'w') as f:
        f.write(content)
    print("SUCCESS: Nginx patched - IP access will redirect to soley.ma")
else:
    print("SKIP: Already patched or pattern not found")
PYEOF

python3 /tmp/patch_nginx.py
nginx -t && systemctl reload nginx && echo "Nginx reloaded OK"
`, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', (code) => {
      console.log('Exit code:', code);
      conn.end();
    });
    stream.on('data', (data) => process.stdout.write(data));
    stream.stderr.on('data', (data) => process.stderr.write(data));
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
