#!/bin/bash

aws s3 sync s3://chatapp-env-files/staging .
unzip env-file.zip
cp .env.staging .env
rm .env.staging
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=$ELASTICACHE_ENDPOINT|g" .env
rm env-file.zip
cp .env .env.staging
zip env-file.zip .env.staging
aws --region eu-central-1 s3 cp env-file.zip s3://chatapp-env-files/staging/
rm -rf .env*
