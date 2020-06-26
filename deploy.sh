if [ "$1" == "prod" ] ; then
   if [ "$2" != "confirm" ] && [ "$3" != "confirm" ] ; then
      echo "Must add 'confirm' to deploy to prod"
      exit 1
   fi
   HOST="root@116.203.118.26"
elif [ "$1" == "dev" ] ; then
   HOST="root@"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

FOLDER="altocode"
TAR="altocode.tar.gz"

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
   scp ../dale/* $HOST:~/altocode/node_modules/dale
   exit 0
fi

if [ "$2" == "teishi" ] ; then
   scp ../teishi/* $HOST:~/altocode/node_modules/teishi
   exit 0
fi

if [ "$2" == "lith" ] ; then
   scp ../lith/* $HOST:~/altocode/node_modules/lith
   exit 0
fi

if [ "$2" == "recalc" ] ; then
   scp ../recalc/* $HOST:~/altocode/node_modules/recalc
   exit 0
fi

if [ "$2" == "cocholate" ] ; then
   scp ../cocholate/* $HOST:~/altocode/node_modules/cocholate
   exit 0
fi

if [ "$2" == "gotob" ] ; then
   ssh $HOST mkdir altocode/node_modules/gotob2
   scp ../gotoB/* $HOST:~/altocode/node_modules/gotob2
   exit 0
fi

cd ..
COPYFILE_DISABLE=true tar --exclude="$FOLDER/arch" --exclude="$FOLDER/*.swp" --exclude="$FOLDER/node_modules" --exclude="$FOLDER/._*" -czvf $TAR $FOLDER 
ssh $HOST rm -r altocode/blog
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
ssh $HOST "cd $FOLDER && npm i --no-save && mg restart"
ssh $HOST rm $TAR
rm $TAR
