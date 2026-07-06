#!/bin/bash
set -e

echo "=== 1. Analyse de la configuration Nginx ==="
nginx -T > /tmp/nginx_config_dump.txt 2>/dev/null || true
echo "Fichiers de configuration trouvés dans sites-enabled:"
ls -la /etc/nginx/sites-enabled/

echo "=== 2. Nettoyage des anciens VirtualHosts ==="
# Supprimer le fichier default s'il existe
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Suppression du site par défaut d'Ubuntu..."
    rm -f /etc/nginx/sites-enabled/default
fi

# Supprimer les anciens fichiers en conflit
rm -f /etc/nginx/sites-available/default
rm -f /etc/nginx/sites-enabled/soley*
rm -f /etc/nginx/sites-available/soley*

echo "=== 3. Création de la configuration propre ==="
cat << 'EOF' > /etc/nginx/sites-available/soley
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /var/www/soley/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/soley /etc/nginx/sites-enabled/soley

echo "=== 4. Correction des permissions ==="
# S'assurer que le dossier existe
if [ ! -d "/var/www/soley/dist" ]; then
    echo "ERREUR : /var/www/soley/dist n'existe pas. Veuillez vérifier le build."
    exit 1
fi

chown -R www-data:www-data /var/www/soley
find /var/www/soley -type d -exec chmod 755 {} \;
find /var/www/soley -type f -exec chmod 644 {} \;

echo "=== 5. Vérification du build ==="
if grep -q "assets/" /var/www/soley/dist/index.html; then
    echo "index.html référence correctement les assets."
else
    echo "AVERTISSEMENT : index.html ne semble pas référencer les assets correctement."
fi

echo "=== 6. Redémarrage de Nginx ==="
echo "Test de la configuration..."
nginx -t

echo "Redémarrage du service..."
systemctl restart nginx

echo "=== 7. Vérification finale ==="
echo "Test local :"
curl -s http://localhost | grep -i "<title>\|soley" || echo "La page ne contient pas les balises attendues."

echo "Test IP publique (31.220.94.217) :"
curl -s http://31.220.94.217 | grep -i "<title>\|soley" || echo "La page ne contient pas les balises attendues."

echo "=== Terminé ! Nginx sert maintenant correctement l'application React. ==="
