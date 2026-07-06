const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected');
  conn.exec(`
    set -e

    echo "=== [1/8] Checking if domain soley.ma resolves to this server ==="
    DOMAIN_IP=$(dig +short soley.ma 2>/dev/null | head -1 || echo "no_dig")
    SERVER_IP="31.220.94.217"
    echo "Domain IP: $DOMAIN_IP | Server IP: $SERVER_IP"
    DOMAIN_MATCHES=false
    if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
      DOMAIN_MATCHES=true
      echo "Domain matches server IP - HTTPS possible"
    else
      echo "Domain does NOT match server IP - skipping Certbot"
    fi

    echo "=== [2/8] Updating Nginx config with compression + security headers ==="
    cat << 'NGINX_EOF' > /etc/nginx/sites-available/soley
# Redirect HTTP to HTTPS (only if domain is available, else serve directly)
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name soley.ma www.soley.ma _;

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

    # Static assets cache (1 year for fingerprinted files)
    location ~* \.(js|css|woff|woff2|ttf|eot|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # Images cache (1 month)
    location ~* \.(jpg|jpeg|png|webp|gif|avif)$ {
        expires 1M;
        add_header Cache-Control "public";
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }

    # robots.txt and sitemap
    location = /robots.txt {
        add_header Content-Type text/plain;
    }
    location = /sitemap.xml {
        add_header Content-Type application/xml;
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
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Block hidden files
    location ~ /\.(?!well-known) {
        deny all;
    }
}
NGINX_EOF

    echo "=== [3/8] Testing Nginx config ==="
    nginx -t

    echo "=== [4/8] Reloading Nginx ==="
    systemctl reload nginx

    echo "=== [5/8] Checking UFW firewall ==="
    if command -v ufw &> /dev/null; then
        ufw status
    else
        echo "Installing UFW..."
        apt-get install -y ufw
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow 22/tcp comment 'SSH'
        ufw allow 80/tcp comment 'HTTP'
        ufw allow 443/tcp comment 'HTTPS'
        echo "y" | ufw enable
        ufw status
    fi

    echo "=== [6/8] Checking Fail2Ban ==="
    if command -v fail2ban-client &> /dev/null; then
        echo "Fail2ban already installed"
        fail2ban-client status
    else
        echo "Installing Fail2ban..."
        apt-get install -y fail2ban
        cat << 'F2B_EOF' > /etc/fail2ban/jail.local
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled  = true
logpath  = /var/log/nginx/error.log

[nginx-botsearch]
enabled  = true
logpath  = /var/log/nginx/error.log
maxretry = 2
F2B_EOF
        systemctl enable fail2ban
        systemctl restart fail2ban
        echo "Fail2ban installed and configured"
    fi

    echo "=== [7/8] Setting up PostgreSQL auto-backup ==="
    mkdir -p /var/backups/soley_postgres
    cat << 'BACKUP_EOF' > /usr/local/bin/soley-backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/soley_postgres"
PGPASSWORD="soley_pass" pg_dump -U soley_user -h localhost soley_db > "$BACKUP_DIR/soley_backup_$DATE.sql"
# Keep only last 7 days
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
echo "Backup completed: soley_backup_$DATE.sql"
BACKUP_EOF
    chmod +x /usr/local/bin/soley-backup.sh
    
    # Add cron job for daily backup at 2am if not exists
    if ! crontab -l 2>/dev/null | grep -q 'soley-backup'; then
        (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/soley-backup.sh >> /var/log/soley-backup.log 2>&1") | crontab -
        echo "Backup cron job added"
    else
        echo "Backup cron job already exists"
    fi

    echo "=== [8/8] Verifying all services ==="
    echo "--- Nginx ---"
    systemctl is-active nginx
    echo "--- PM2 ---"
    pm2 status
    echo "--- PostgreSQL ---"
    systemctl is-active postgresql
    
    echo "=== INFRASTRUCTURE SETUP COMPLETE ==="

  `, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Done. Code:', code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      process.stdout.write('STDERR: ' + data);
    });
  });
}).connect({
  host: '31.220.94.217',
  port: 22,
  username: 'root',
  password: 'B@51275ua'
});
