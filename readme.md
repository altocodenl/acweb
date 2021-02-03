## HTTPS

sudo apt-get install -y certbot python3-certbot-nginx
sudo vim /etc/nginx/sites-enabled/default
   # set server_name to DOMAIN.TLD;
sudo service nginx reload
sudo certbot --nginx -d DOMAIN.TLD
crontab -e: 30 2 * * * sudo certbot renew
