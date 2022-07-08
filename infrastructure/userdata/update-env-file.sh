#!/bin/bash

aws s3 sync s3://chatapp-env-files-1/staging . --profile tutorial
unzip env-file.zip
cp .env.staging .env
rm -rf .env.staging
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=redis://$ELASTICACHE_ENDPOINT:6379|g" .env
rm -rf env-file.zip
cp .env .env.staging
zip env-file.zip .env.staging
aws s3 cp env-file.zip s3://chatapp-env-files-1/staging/ --profile tutorial
rm -rf .env*
rm -rf env-file.zip
