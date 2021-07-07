# PUBLIC SUBNETS
resource "aws_subnet" "public_subnet_a" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "eu-central-1a"
  map_public_ip_on_launch = true

  tags = merge(
      local.common_tags,
      tomap({ "Name" = "${local.prefix}-public-1a" })
  )
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.2.0/24"
  availability_zone = "eu-central-1b"
  map_public_ip_on_launch = true

  tags = merge(
      local.common_tags,
      tomap({ "Name" = "${local.prefix}-public-1b" })
  )
}

# PRIVATE SUBNETS
resource "aws_subnet" "private_subnet_a" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.3.0/24"
  availability_zone = "eu-central-1a"

  tags = merge(
      local.common_tags,
      tomap({ "Name" = "${local.prefix}-private-1a" })
  )
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.4.0/24"
  availability_zone = "eu-central-1b"

  tags = merge(
      local.common_tags,
      tomap({ "Name" = "${local.prefix}-private-1b" })
  )
}



