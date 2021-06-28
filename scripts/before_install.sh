#!/bin/bash

DIR="/home/ec2-user/chatapp-server"
if [ -d "$DIR" ]; then
    cd /home/ec2-user
    sudo rm -rf chatapp-server
else
    echo "Directory does not exist."
fi
