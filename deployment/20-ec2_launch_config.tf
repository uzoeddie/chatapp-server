# resource "aws_launch_template" "asg_launch_template" {
#   name                   = "${local.prefix}-lauch-template"
#   description            = "EC2 Launch Template"
#   image_id               = data.aws_ami.ec2_ami.id
#   instance_type          = var.ec2_instance_type
#   vpc_security_group_ids = [aws_security_group.autoscaling_group_sg.id]
#   ebs_optimized          = true
#   update_default_version = false
#   key_name               = "appKeyPair"
#   user_data              = filebase64("${path.module}/userdata/user-data.sh")
#   iam_instance_profile {
#     name = "chatapp-server-ec2-instance-profile"
#   }
#   monitoring {
#     enabled = true
#   }
#   # block_device_mappings {
#   #   device_name = "/dev/sda1"
#   #   ebs {
#   #     volume_size           = 4
#   #     delete_on_termination = true
#   #   }
#   # }
#   tag_specifications {
#     resource_type = "instance"

#     tags = {
#       Name = "${local.prefix}-ec2"
#     }
#   }
#   lifecycle {
#     create_before_destroy = true
#   }
# }

resource "aws_launch_configuration" "asg_launch_configuration" {
  name                        = "${local.prefix}-lauch-config"
  image_id                    = data.aws_ami.ec2_ami.id
  instance_type               = var.ec2_instance_type
  key_name                    = "appKeyPair"
  associate_public_ip_address = false
  iam_instance_profile        = aws_iam_instance_profile.ec2_instance_profile.name
  security_groups             = [aws_security_group.autoscaling_group_sg.id]
  user_data                   = filebase64("${path.module}/userdata/user-data.sh")

  lifecycle {
    create_before_destroy = true
  }
}
