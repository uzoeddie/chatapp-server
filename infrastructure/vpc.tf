resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = merge(
      local.common_tags,
      tomap({ "Name" = "${local.prefix}-vpc" })
  )
}
