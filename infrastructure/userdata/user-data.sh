#!/bin/bash

function program_is_installed {
    local return_=1

    type $1 >/dev/null 2>&1 || { local return_=0; }
    echo "$return_"
}

sudo yum update -y
sudo yum install ruby -y
sudo yum install wget -y
cd /home/ec2-user
wget https://aws-codedeploy-eu-central-1.s3.eu-central-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto

# Check if NodeJs is installed. if not, install it
if [ $(program_is_installed node) == 0 ]; then
    curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -

    sudo yum install -y nodejs
fi

# Check if git is installed
if [ $(program_is_installed git) == 0 ]; then
    sudo yum install git -y
fi

# Check if docker is installed
if [ $(program_is_installed docker) == 0 ]; then
    # for amazon linux 2
    sudo amazon-linux-extras install docker -y
    # start docker service
    sudo systemctl start docker
    # start docker redis server in detach mode
    sudo docker run --name chatapp-redis -p 6379:6379 --restart always --detach redis
    # sudo docker run --name chatapp-redis -d -p 6379:6379 --restart always --detach redislabs/redisearch:latest
fi

# Check if git is installed
if [ $(program_is_installed pm2) == 0 ]; then
  npm install -g pm2
fi

cd /home/ec2-user

git clone -b develop https://github.com/uzoeddie/chatapp-server.git
cd chatapp-server
npm install
aws s3 sync s3://chatapp-env-files/develop .
unzip env-file.zip
cp .env.develop .env
npm run build
npm start
