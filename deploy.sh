if [ "$1" == "prod" ] ; then
   if [ "$2" != "confirm" ] && [ "$3" != "confirm" ] ; then
      echo "Must add 'confirm' to deploy to prod"
      exit 1
   fi
   HOST="root@altocode.nl"
elif [ "$1" == "dev" ] ; then
   HOST="root@"
else
   echo "Must specify environment (dev|prod)"
   exit 1
fi

FOLDER="altocode"
TAR="altocode.tar.gz"

ssh $HOST mkdir altocode/node_modules/gotob2
scp ../gotoB/* $HOST:~/altocode/node_modules/gotob2
#exit 0
cd ..
tar --exclude="$FOLDER/arch" --exclude="$FOLDER/*.swp" --exclude="$FOLDER/node_modules" -czvf $TAR $FOLDER
scp $TAR $HOST:
ssh $HOST tar xzvf $TAR
echo "main = node server $1" | ssh $HOST "cat >> $FOLDER/mongroup.conf"
ssh $HOST "cd $FOLDER && npm i --no-save && mg restart"
ssh $HOST rm $TAR
rm $TAR
