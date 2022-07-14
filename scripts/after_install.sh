#!/bin/bash

cd /home/ec2-user/chatapp-server
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.production
aws s3 sync s3://chatapp-env-files-1/develop .
unzip env-file.zip
sudo cp .env.production .env
sudo pm2 delete all
# sudo rm -rf node_modules
# sudo npm install -g npm
sudo npm install -g typescript-transform-paths
sudo npm install --force
