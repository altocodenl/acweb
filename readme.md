## HTTPS

sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
sudo vim /etc/nginx/sites-enabled/default
   server_name DOMAIN.TLD;
sudo service nginx reload
sudo certbot --nginx -d DOMAIN.TLD
crontab -e: 30 2 * * * sudo certbot renew

## Wordpress (assumes nginx already present)

```
sudo apt-get update
sudo apt-get install mysql-server
mysql_secure_installation
mysql -u root -p$ROOT_PASSWORD <<EOF
CREATE USER 'wordpress'@'localhost' IDENTIFIED BY '$WP_PASSWORD';
CREATE DATABASE wordpress;
GRANT ALL ON wordpress.* TO 'wordpress'@'localhost';
EOF

sudo apt-get install -y php7.2-fpm php7.2-common php7.2-mbstring php7.2-xmlrpc php7.2-soap php7.2-gd php7.2-xml php7.2-intl php7.2-mysql php7.2-cli php7.2-zip php7.2-curl

sudo service nginx restart
sudo service php7.2-fpm restart

mkdir /var/www/wordpress
mkdir /var/www/wordpress/logs

vim /etc/nginx/sites-enabled

   server {
      server_name blog.altocode.nl;

      root /var/www/wordpress/public;
      index index.php;

      access_log /var/www/wordpress/logs/access.log;
      error_log  /var/www/wordpress/logs/error.log;

      location / {
         try_files $uri $uri/ /index.php?$args;
      }

      location ~ \.php$ {
         include fastcgi.conf;
         fastcgi_pass unix:/run/php/php7.2-fpm.sock;
      }
   }

sudo service nginx restart

mkdir /var/www/wordpress/public
cd /var/www/wordpress/public
wget http://wordpress.org/latest.tar.gz && tar xfz latest.tar.gz --strip-components=1
rm latest.tar.gz

cp wp-config-sample.php wp-config.php
vim wp-config.php
   Add database name, user & password.
   Add authentication keys & salts.
```
