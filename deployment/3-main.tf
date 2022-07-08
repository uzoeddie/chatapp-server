terraform {
  backend "s3" {
    bucket  = var.tf_backend_bucket
    key     = var.tf_backend_bucket_key
    region  = var.aws_region
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Uzochukwu Eddie Odozi"
  }
}
