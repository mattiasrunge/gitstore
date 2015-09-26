#!/bin/bash

APPDIR=$1
REPODIR=$2
REPONAME=$3
URL=$4

cd $REPODIR
mkdir $REPONAME
cd $REPONAME
git init --bare
cp $APPDIR/post-receive-hook.sh hooks/post-receive
sed -i "s|url|$URL|g" hooks/post-receive
sed -i "s|name|$REPONAME|g" hooks/post-receive
chmod +x hooks/post-receive
echo "Done!"
