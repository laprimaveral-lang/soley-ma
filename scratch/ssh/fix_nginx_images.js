const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Patching Nginx upload path priority...');
  conn.exec(`
cat > /tmp/patch_nginx_images.py << 'PYEOF'
config_path = '/etc/nginx/sites-available/soley'

with open(config_path, 'r') as f:
    content = f.read()

# Replace the location block to use ^~ priority modifier
old_block = """    # Uploaded products directory
    location /assets/products/ {"""

new_block = """    # Uploaded products directory
    location ^~ /assets/products/ {"""

if old_block in content and new_block not in content:
    content = content.replace(old_block, new_block)
    with open(config_path, 'w') as f:
        f.write(content)
    print("SUCCESS: Nginx patched - Uploads will bypass regex locations")
else:
    print("SKIP: Already patched or pattern not found")
PYEOF

python3 /tmp/patch_nginx_images.py
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
