# Manually create your backend hosted zone on AWS route53
# and add the NS to the DNS of your domain on your provider dashboard

# Get your already created hosted zone
data "aws_route53_zone" "main" {
  name         = var.main_api_server_domain
  private_zone = false
}
