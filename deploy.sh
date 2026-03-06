#!/bin/bash
set -e

DEPLOY_DIR="/var/www/auto-notes.ru"

echo "=== Building client ==="
cd apps/client
npx vite build
cd ../..

echo "=== Building server ==="
cd apps/server
npx nest build
cd ../..

echo "=== Deploying files ==="
sudo mkdir -p "$DEPLOY_DIR/landing"
sudo mkdir -p "$DEPLOY_DIR/client"

# Landing page
sudo cp -r landing/* "$DEPLOY_DIR/landing/"

# Client SPA
sudo cp -r apps/client/dist/* "$DEPLOY_DIR/client/"

echo "=== Deploying nginx configs ==="
sudo cp nginx/auto-notes.ru.conf /etc/nginx/sites-available/auto-notes.ru
sudo cp nginx/my.auto-notes.ru.conf /etc/nginx/sites-available/my.auto-notes.ru
sudo ln -sf /etc/nginx/sites-available/auto-notes.ru /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/my.auto-notes.ru /etc/nginx/sites-enabled/

echo "=== Testing nginx config ==="
sudo nginx -t

echo "=== Reloading nginx ==="
sudo systemctl reload nginx

echo "=== Done ==="
echo "Landing: http://auto-notes.ru"
echo "App:     http://my.auto-notes.ru"
