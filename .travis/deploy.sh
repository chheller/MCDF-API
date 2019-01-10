#!/bin/bash
set -e
set -u
HOST_IP=$1
openssl aes-256-cbc -K $encrypted_71a8e2a8b8b0_key -iv $encrypted_71a8e2a8b8b0_iv -in .travis/key.enc -out .travis/key -d
eval "$(ssh-agent -s)"
ssh-keyscan -H $HOST_IP >> $HOME/.ssh/known_hosts
chmod 600 .travis/key
ssh-add .travis/key

echo $DOCKER_SWARM_USER_PASSWORD | ssh swarm@$HOST_IP sudo -S docker service update --image chheller/stator stator-api