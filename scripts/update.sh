#!/bin/sh

REPOURL=$1
REMOTEURL=$2
TMPDIR=$(mktemp -d)

git clone $REMOTEURL $TMPDIR
cd $TMPDIR
git remote set-url origin $REPOURL
git push --all origin
cd ..
rm $TMPDIR -rf
echo "Done!"
