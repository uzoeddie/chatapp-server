#!/bin/bash

cd /home/ec2-user/chatapp-server
sudo rm -rf env-file.zip
sudo rm -rf .env
sudo rm -rf .env.staging
aws s3 sync s3://chatapp-env-files-1/staging .
unzip env-file.zip
sudo cp .env.staging .env
sudo pm2 delete all
sudo npm install -g typescript-transform-paths
sudo npm install --force
