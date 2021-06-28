#!/bin/bash

cd /home/ec2-user/chatapp-server
sudo npm run build --force
sudo npm start
