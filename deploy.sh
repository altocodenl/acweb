if [ "$1" == "prod" ] ; then
   if [ "$2" != "confirm" ] && [ "$3" != "confirm" ] ; then
      echo "Must add 'confirm' to deploy to prod"
      exit 1
   fi
   HOST="root@95.216.118.115"
elif [ "$1" == "dev" ] ; then
   HOST="root@136.243.174.166"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

FOLDER="acweb"
TAR="acweb.tar.gz"

if [ "$2" == "client" ] ; then
   scp client.js $HOST:$FOLDER
   exit 0
fi

if [ "$2" == "server" ] ; then
   scp server.js $HOST:$FOLDER
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

if [ "$2" == "blog" ] ; then
   ssh $HOST "cd $FOLDER && rm -r blog/*"
   scp -r blog/* $HOST:$FOLDER/blog
   scp server.js $HOST:$FOLDER
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

if [ "$2" == "dale" ] ; then
   scp ../dale/* $HOST:~/$FOLDER/node_modules/dale
   exit 0
fi

if [ "$2" == "teishi" ] ; then
   scp ../teishi/* $HOST:~/$FOLDER/node_modules/teishi
   exit 0
fi

if [ "$2" == "lith" ] ; then
   scp ../lith/* $HOST:~/$FOLDER/node_modules/lith
   scp server.js $HOST:$FOLDER
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

if [ "$2" == "recalc" ] ; then
   scp ../recalc/* $HOST:~/$FOLDER/node_modules/recalc
   exit 0
fi

if [ "$2" == "cocholate" ] ; then
   scp ../cocholate/* $HOST:~/$FOLDER/node_modules/cocholate
   scp server.js $HOST:$FOLDER
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

if [ "$2" == "gotob" ] ; then
   ssh $HOST mkdir $FOLDER/node_modules/gotob
   ssh $HOST mkdir $FOLDER/node_modules/gotob/examples
   ssh $HOST mkdir $FOLDER/node_modules/gotob/tutorial
   scp -r ../gotoB/* $HOST:~/$FOLDER/node_modules/gotob
   scp server.js $HOST:$FOLDER
   ssh $HOST "cd $FOLDER && mg restart"
   exit 0
fi

cd ..
COPYFILE_DISABLE=true tar --exclude="$FOLDER/arch" --exclude="$FOLDER/*.swp" --exclude="$FOLDER/node_modules" --exclude="$FOLDER/._*" -czvf $TAR $FOLDER
ssh $HOST rm -r $FOLDER/blog
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
ssh $HOST chown -R root /root/$FOLDER
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
ssh $HOST "cd $FOLDER && npm i --no-save && mg restart"
ssh $HOST rm $TAR
rm $TAR
