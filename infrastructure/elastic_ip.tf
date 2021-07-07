resource "aws_eip" "elastic_ip" {
    tags = merge(
      local.common_tags,
      tomap({ "Name" = "${local.prefix}-eip" })
    )
}
