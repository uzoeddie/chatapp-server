#!/bin/bash

cd /home/ec2-user/chatapp-server
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.develop
aws s3 sync s3://chatapp-env-files/develop .
unzip env-file.zip
sudo cp .env.develop .env
sudo pm2 delete all
sudo rm -rf node_modules
sudo npm install -g npm@6.14.8
sudo npm install --force
sudo npm install -g ttypescript