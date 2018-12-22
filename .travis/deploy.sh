#!/bin/bash
set -e
set -u
HOST_IP=$1
openssl aes-256-cbc -K $encrypted_8e5d82c714da_key -iv $encrypted_8e5d82c714da_iv -in .travis/key.enc -out .travis/key -d
eval "$(ssh-agent -s)"
ssh-keyscan -H $DOCKER_SWARM_HOST_IP >> $HOME/.ssh/known_hosts
chmod 600 .travis/key
ssh-add .travis/key

echo $DOCKER_SWARM_USER_PASSWORD | ssh swarm@$HOST_IP sudo -S docker service update --image chheller/stator stator-api