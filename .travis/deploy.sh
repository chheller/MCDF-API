#!/bin/bash
set -e
set -u
HOST_IP=$1
openssl aes-256-cbc -K $key -iv $key_iv,l -in .travis/key.enc -out .travis/key -d
eval "$(ssh-agent -s)"
ssh-keyscan -H $HOST_IP >> $HOME/.ssh/known_hosts
chmod 600 .travis/key
ssh-add .travis/key

echo $DOCKER_SWARM_USER_PASSWORD | ssh $SSH_USER@$HOST_IP sudo -S docker service update --image chheller/mcdf-api mcdf-api