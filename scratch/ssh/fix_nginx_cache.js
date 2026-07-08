const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const command = `
# Add no-cache header for index.html in nginx config
sed -i '/location \\/ {/a\\        add_header Cache-Control "no-cache, no-store, must-revalidate";\\n        add_header Pragma "no-cache";\\n        add_header Expires "0";' /etc/nginx/sites-available/soley 2>/dev/null || true

# Better approach: write a proper no-cache rule for index.html directly
cat > /tmp/nginx_nocache_patch.py << 'PYEOF'
import re

with open('/etc/nginx/sites-available/soley', 'r') as f:
    config = f.read()

# Add no-cache for index.html and SPA fallback
nocache_block = """
    # No cache for index.html (SPA entry point)
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri =404;
    }

    # Long cache for hashed static assets
    location ~* \\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
"""

# Insert before the closing brace of the server block
if 'location = /index.html' not in config:
    config = config.replace('location / {', nocache_block + '\n    location / {', 1)

with open('/etc/nginx/sites-available/soley', 'w') as f:
    f.write(config)

print("Nginx config patched with no-cache for index.html")
PYEOF

python3 /tmp/nginx_nocache_patch.py

nginx -t && systemctl reload nginx && echo "Nginx reloaded successfully"
`;

conn.on('ready', () => {
  console.log('SSH Connected - Patching Nginx cache headers...');
  conn.exec(command, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', (code) => {
      console.log(`Exit code: ${code}`);
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
