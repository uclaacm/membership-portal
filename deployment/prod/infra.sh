#! /bin/bash

# set up docker and utils
sudo apt -y update
sudo apt -y upgrade

sudo apt -y install \
    apt-transport-https \
    ca-certificates \
    curl git make python python-pip awscli \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

sudo apt -y update
sudo apt -y install docker-ce

sudo bash -c 'curl -L https://github.com/docker/compose/releases/download/1.16.1/docker-compose-`uname -s`-`uname -m` > /usr/bin/docker-compose'
sudo chmod +x /usr/bin/docker-compose

sudo service docker start

# create swap space
sudo dd if=/dev/zero of=/swap bs=4M count=256
sudo chmod 600 /swap
sudo mkswap /swap
sudo swapon /swap
sudo swapon -s

# setup the repo
make setup

# set up aws
aws configure
