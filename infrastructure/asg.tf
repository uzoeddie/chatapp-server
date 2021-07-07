resource "aws_launch_configuration" "asg_launch_configuration" {
  name                        = "${local.prefix}-lauch-config"
  image_id                    = "ami-089b5384aac360007"
  instance_type               = "t2.micro"
  key_name                    = "TESTKP"
  associate_public_ip_address = false
  iam_instance_profile        = aws_iam_instance_profile.ec2_instance_profile.name
  security_groups             = [aws_security_group.autoscaling_group_sg.id]
  user_data                   = file("./userdata/user-data.sh")

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "ec2_autoscaling_group" {
  name                      = "${local.prefix}-ASG"
  vpc_zone_identifier       = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
  max_size                  = 4
  min_size                  = 1
  launch_configuration      = aws_launch_configuration.asg_launch_configuration.name
  health_check_type         = "ELB"
  health_check_grace_period = 600
  default_cooldown          = 150
  force_delete              = true
  target_group_arns         = [aws_alb_target_group.server_backend_tg.arn]
  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTotalInstances"
  ]

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_elasticache_replication_group.chatapp_redis_cluster]

  tag {
    key                 = "Name"
    value               = "EC2-ASG-${terraform.workspace}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Type"
    value               = "Backend-${terraform.workspace}"
    propagate_at_launch = true
  }
}

resource "aws_autoscaling_policy" "asg_scale_out_policy" {
  name                   = "ASG-SCALE-OUT-POLICY-STAGING"
  autoscaling_group_name = aws_autoscaling_group.ec2_autoscaling_group.name
  adjustment_type        = "ChangeInCapacity"
  policy_type            = "SimpleScaling"
  scaling_adjustment     = 1
  cooldown               = 150
}

resource "aws_cloudwatch_metric_alarm" "ec2_scale_out_alarm" {
  alarm_name          = "EC2-SCALE-OUT-ALARM-STAGING"
  alarm_description   = "This metric monitors EC2 CPU utilization"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = 50

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ec2_autoscaling_group.name
  }
  alarm_actions = [aws_autoscaling_policy.asg_scale_out_policy.arn]
}

resource "aws_autoscaling_policy" "asg_scale_in_policy" {
  name                   = "ASG-SCALE-IN-POLICY-STAGING"
  autoscaling_group_name = aws_autoscaling_group.ec2_autoscaling_group.name
  adjustment_type        = "ChangeInCapacity"
  policy_type            = "SimpleScaling"
  scaling_adjustment     = -1
  cooldown               = 150
}

resource "aws_cloudwatch_metric_alarm" "ec2_scale_in_alarm" {
  alarm_name          = "EC2-SCALE-IN-ALARM-STAGING"
  alarm_description   = "This metric monitors EC2 CPU utilization"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "120"
  statistic           = "Average"
  threshold           = 10

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.ec2_autoscaling_group.name
  }
  alarm_actions = [aws_autoscaling_policy.asg_scale_in_policy.arn]
}
