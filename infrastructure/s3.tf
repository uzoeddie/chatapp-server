resource "aws_s3_bucket" "backend_server_s3_bucket" {
  bucket = "${local.prefix}-app"
  acl = "private"
  force_destroy = true

  versioning {
      enabled = true
  }

  tags = local.common_tags
}
