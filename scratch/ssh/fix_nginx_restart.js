const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Rewriting Nginx config and RESTARTING...');
  conn.exec(`
cat > /etc/nginx/sites-available/soley << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://soley.ma$request_uri;
}

server {
    client_max_body_size 20M;
    server_name soley.ma www.soley.ma;

    root /var/www/soley/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /assets/products/ {
        alias /var/www/soley/public/assets/products/;
        autoindex off;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # All other static assets
    location /assets/ {
        alias /var/www/soley/dist/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri $uri/ /index.html;
    }

    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/soley.ma/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/soley.ma/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    client_max_body_size 20M;
    if ($host = www.soley.ma) {
        return 301 https://$host$request_uri;
    }

    if ($host = soley.ma) {
        return 301 https://$host$request_uri;
    }

    listen 80 ;
    listen [::]:80 ;
    server_name soley.ma www.soley.ma;
    return 404;
}
EOF

ln -sf /etc/nginx/sites-available/soley /etc/nginx/sites-enabled/soley

nginx -t && systemctl restart nginx && echo "Nginx RESTARTED successfully"

echo "=== Testing Nginx response ==="
curl -I https://soley.ma/assets/products/1783507070482-Matte%20beige.png
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
