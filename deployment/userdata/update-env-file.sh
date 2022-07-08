#!/bin/bash

# Add this bucket policy to the env files s3 bucket
# {
#     "Version": "2012-10-17",
#     "Statement": [
#         {
#             "Effect": "Allow",
#             "Principal": {
#                 "AWS": "arn:aws:iam::144134187792:user/eddie"
#             },
#             "Action": [
#                 "s3:PutObject",
#                 "s3:PutObjectAcl",
#                 "s3:GetObject",
#                 "s3:GetObjectAcl",
#                 "s3:DeleteObject"
#             ],
#             "Resource": "arn:aws:s3:::chatapp-env-files-1/*"
#         }
#     ]
# }

# Only use a profile if you are not using a default profile

aws s3 sync s3://chatapp-env-files-1/staging . --profile tutorial
unzip env-file.zip
cp .env.staging .env
rm .env.staging
sed -i -e "s|\(^REDIS_HOST=\).*|REDIS_HOST=redis://$ELASTICACHE_ENDPOINT:6379|g" .env
rm -rf env-file.zip
cp .env .env.staging
zip env-file.zip .env.staging
aws s3 cp env-file.zip s3://chatapp-env-files/staging/ --profile tutorial
rm -rf .env*
rm -rf env-file.zip
