HOST="root@116.203.118.26"
ssh $HOST apt-get update
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs
ssh $HOST apt-get install fail2ban -y
ssh $HOST apt-get install htop sysstat -y
ssh $HOST "curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -"
ssh $HOST apt-get install nodejs -y
ssh $HOST apt-get install build-essential -y
ssh $HOST apt-get install git -y
ssh $HOST '(mkdir /tmp/mon && cd /tmp/mon && curl -L# https://github.com/tj/mon/archive/master.tar.gz | tar zx --strip 1 && make install && rm -rf /tmp/mon)'
ssh $HOST npm install -g mongroup
ssh $HOST apt-get install vim -y
ssh $HOST wget https://raw.githubusercontent.com/fpereiro/vimrc/master/vimrc -O .vimrc
ssh $HOST apt-get install redis-server -y
ssh $HOST apt-get install nginx -y
ssh $HOST sudo add-apt-repository ppa:certbot/certbot -y
ssh $HOST sudo apt-get update
ssh $HOST sudo apt-get install python-certbot-nginx -y
#sudo vim /etc/nginx/sites-available/default
   # server_name SERVER_NAME
# service nginx reload
# sudo certbot --nginx -d SERVER_NAME
# crontab: M H * * * sudo certbot renew
ssh $HOST shutdown -r now
