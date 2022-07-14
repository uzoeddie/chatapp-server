#!/bin/bash

# Terraform does not manage ASG created by CodeDeploy
# To delete ASG created by code deploy, use aws cli command
# but you need to get the name of the ASG

ASG=$(aws autoscaling describe-auto-scaling-groups --no-paginate --output text --query "AutoScalingGroups[? Tags[? (Key=='Type') && Value=='$ENV_TYPE']]".AutoScalingGroupName)
aws autoscaling delete-auto-scaling-group --auto-scaling-group-name $ASG --force-delete

