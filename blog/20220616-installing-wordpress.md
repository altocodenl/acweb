How to install Wordpress in Ubuntu 20.04
# How to install Wordpress in Ubuntu 20.04

Recently we started self-hosting a couple of Wordpress sites. Rather than rush through installation, we decided to take the time to make it as automated as possible, and document our steps thoroughly in a bash script.

The following references were useful to us:
- https://www.hostinger.com/tutorials/how-to-install-wordpress-with-nginx-on-ubuntu/
- https://stackoverflow.com/questions/52372165/mysql-error-1064-42000-you-have-an-error-in-your-sql-syntax
- https://stackoverflow.com/questions/4937792/using-variables-inside-a-bash-heredoc

Below is the bash script with which we did it. Feel free to borrow and adapt it. Most importantly, be aware that
- The script is supposed to be run in an Ubuntu 20.04 server.
- You need to replace the three variables at the top of the script.
- The script is intended to run in your computer and execute commands remotely in the server - for this reason you need to have SSH access to the server.
- The script will install and configure nginx, mysql and php.
- The script **will overwrite** any nginx configuration you may have in your server - you might have to instead copy and paste the config we put in the script. If you do this, replacd `try_files \$uri \$uri/ /index.php?$args;` by `try_files $uri $uri/ /index.php?$args;`.
- The part of the script that requires HTTPS will require interaction from you. It will also require that your server is reachable at a certain IP which is the same IP to which your domain name A DNS record points to.

Here goes the script.


```bash
# Variables (replace with your own)
HOST="USER@HOST"
PASSWORD="PASSWORD"
BLOG_DOMAIN="MYDOMAIN.COM"

# Basic setup
ssh $HOST apt-get update
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs
ssh $HOST apt-get install fail2ban -y

# Setup nginx & mysql
ssh $HOST apt-get install nginx -y
ssh $HOST apt-get install mysql-server -y
ssh $HOST 'mysql -u root -p -e "CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"'
ssh $HOST 'mysql -u root -p -e "CREATE USER '"'"'wordpress'"'"'@'"'"'%'"'"' IDENTIFIED BY '"'$PASSWORD'"';"'
ssh $HOST 'mysql -u root -p -e "GRANT ALL PRIVILEGES ON wordpress.* TO '"'"'wordpress'"'"'@'"'"'%'"'"';"'
ssh $HOST 'mysql -u root -p -e "FLUSH PRIVILEGES;"'

# Install PHP & wordpress
ssh $HOST apt-get install -y php7.4-cli php7.4-fpm php7.4-mysql php7.4-json php7.4-opcache php7.4-mbstring php7.4-xml php7.4-gd php7.4-curl
ssh $HOST wget https://wordpress.org/latest.tar.gz
ssh $HOST tar xzvf latest.tar.gz
ssh $HOST rm latest.tar.gz
ssh $HOST mkdir -p /var/www/$BLOG_DOMAIN
ssh $HOST mv wordpress/* /var/www/$BLOG_DOMAIN
ssh $HOST chown -R www-data: /var/www/$BLOG_DOMAIN

# Set up nginx configuration (this will overwrite any existing configuration!)
ssh $HOST tee /etc/nginx/sites-enabled/default > /dev/null <<EOF
server {
   listen 80 default_server;
   listen [::]:80 default_server;

   server_name _;

   root /var/www/$BLOG_DOMAIN;
   index index.php;

   location / {
      try_files \$uri \$uri/ /index.php?$args;
   }

   location ~ \.php$ {
      include snippets/fastcgi-php.conf;
      fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
   }
}
EOF

ssh $HOST service nginx restart

# Set up HTTPS
ssh $HOST apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d $BLOG_DOMAIN

# Cleanup and restart
ssh $HOST apt-get autoremove -y
ssh $HOST apt-get clean
ssh $HOST shutdown -r now
```

If you'd rather run the commands individually, you can copy and paste them one by one in the terminal of your server.

Once the script is run, if you go to your domain name in a browser, you will be prompted to start the Wordpress configuration. The required DB credentials are `Wordpress` (for the user) and `PASSWORD` (the one you put at the top of the script) for your password.

Enjoy!
