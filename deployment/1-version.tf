terraform {
  required_version = "~> 1.2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  # If your aws credentials is not in the default profile on your machine,
  # then add the profile name otherwise leave out or set as default.
  # profile = "tutorial"
}
