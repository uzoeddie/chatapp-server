resource "aws_instance" "bastion_host" {
  ami                         = "ami-089b5384aac360007"
  instance_type               = "t2.micro"
  vpc_security_group_ids      = [aws_security_group.bastion_host_sg.id]
  subnet_id                   = aws_subnet.public_subnet_a.id
  key_name                    = "TESTKP"
  associate_public_ip_address = true
  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-bastion-host" })
  )
}
