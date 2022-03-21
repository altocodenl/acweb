HOST="root@116.203.118.26"
ssh $HOST apt-get update
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs
ssh $HOST DEBIAN_FRONTEND=noninteractive apt-get install -y systemd
ssh $HOST timedatectl set-timezone UTC
ssh $HOST apt-get install -y fail2ban
ssh $HOST apt-get install -y htop sysstat vim curl wget unzip
ssh $HOST 'curl -sL https://deb.nodesource.com/setup_16.x | bash -'
ssh $HOST apt-get install -y nodejs
ssh $HOST apt-get install -y build-essential git
ssh $HOST 'mkdir /tmp/mon && cd /tmp/mon && curl -L# https://github.com/tj/mon/archive/master.tar.gz | tar zx --strip 1 && make install && rm -rf /tmp/mon'
ssh $HOST npm install -g mongroup
ssh $HOST wget https://raw.githubusercontent.com/fpereiro/vimrc/master/vimrc -O .vimrc
ssh $HOST apt-get install redis-server -y

# The two commands immediately below are only for servers receiving outside traffic
ssh $HOST apt-get install -y nginx
ssh $HOST apt-get install -y certbot python3-certbot-nginx

ssh $HOST git clone https://github.com/altocodenl/acweb
ssh $HOST 'cd acweb && npm i --no-save --production'

# Allow up to 1024 simultaneous connection requests
ssh $HOST 'echo "net.core.somaxconn=1024" >> /etc/sysctl.conf'
# Allow overcommit_memory for Redis
ssh $HOST 'echo "vm.overcommit_memory=1"  >> /etc/sysctl.conf'

# Place start.sh script
# Many thanks to https://thornelabs.net/posts/remotely-execute-multi-line-commands-with-ssh.html
ssh $HOST -T << EOF
cat << "EOT" >> ~/start.sh
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
# Configure THP (required by Redis)
echo madvise > /sys/kernel/mm/transparent_hugepage/enabled
service redis-server restart
# Wait 5 seconds until DNS can be properly resolved
sleep 5
cd /root/acweb && mg restart
EOT
EOF
ssh $HOST chmod 777 /root/start.sh

# Place refresh.sh script
ssh $HOST -T << EOF
cat << "EOT" >> ~/refresh.sh
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
apt-get update && DEBIAN_FRONTEND=noninteractive apt-get upgrade -y --with-new-pkgs
apt-get autoremove -y && apt-get clean
cd /root/acweb && mg stop
service redis-server stop
shutdown -r now
EOT
EOF
ssh $HOST chmod 777 /root/refresh.sh

# Add crontab entries (change the second entry's time as needed)
ssh $HOST '(crontab -l ; echo "@reboot ~/start.sh") | sort - | uniq - | crontab -'
ssh $HOST '(crontab -l ; echo "15 5 * * 1 /root/refresh.sh") | sort - | uniq - | crontab -'

ssh $HOST apt-get autoremove -y
ssh $HOST apt-get clean
ssh $HOST shutdown -r now

# MANUAL STEP: add secret.js to /root/acweb
# MANUAL STEP: HTTPS configuration, run the following command: certbot --nginx -d altocode.nl
