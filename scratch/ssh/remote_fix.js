const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected - Deploying full production changes');
  conn.exec(`
    set -e
    cd /var/www/soley
    
    echo "=== [1/5] Pulling latest code ==="
    git fetch origin main
    git reset --hard origin/main
    
    echo "=== [2/5] Building frontend ==="
    npm install
    npm run build
    
    echo "=== [3/5] Syncing database & building server ==="
    cd server
    npm install
    npx prisma db push
    npx prisma generate
    npm run build
    
    echo "=== [4/5] Restarting PM2 ==="
    cd /var/www/soley
    pm2 delete soley || true
    pm2 start ecosystem.config.cjs
    pm2 save
    
    echo "=== [5/5] Reconfiguring Nginx ==="
    cat << 'NGINX_EOF' > /etc/nginx/sites-available/soley
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

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

    # Uploaded products directory
    location /assets/products/ {
        alias /var/www/soley/public/assets/products/;
        expires 1M;
        add_header Cache-Control "public";
    }

    # Static assets cache (1 year)
    location ~* \.(js|css|woff|woff2|ttf|eot|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Images cache (1 month)
    location ~* \.(jpg|jpeg|png|webp|gif|avif)$ {
        expires 1M;
        add_header Cache-Control "public";
    }

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

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Block hidden files
    location ~ /\.ht {
        deny all;
    }
}
NGINX_EOF

    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/soley /etc/nginx/sites-enabled/soley
    
    nginx -t
    systemctl reload nginx
    
    echo "=== Final verification ==="
    sleep 2
    
    echo "--- Site HTML ---"
    curl -s -I http://127.0.0.1 | head -15
    
    echo "--- API Products ---"
    curl -s -I http://127.0.0.1/api/products
    
    echo "=== PM2 STATUS ==="
    pm2 status
    
    echo "=== DEPLOYMENT COMPLETE === "
  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Done. Code:', code);
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
