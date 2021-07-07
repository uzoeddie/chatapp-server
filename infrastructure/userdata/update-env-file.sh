#!/bin/bash

aws s3 sync s3://chatapp-env-files/develop .
unzip env-file.zip
cp .env.develop .env
rm .env.develop
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=$ELASTICACHE_ENDPOINT|g" .env
rm env-file.zip
cp .env .env.develop
zip env-file.zip .env.develop
aws --region eu-central-1 s3 cp env-file.zip s3://chatapp-env-files/develop/
rm -rf .env*
