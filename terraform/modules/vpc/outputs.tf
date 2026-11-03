output "vpc_id" {
  value = aws_vpc.main.id
}

output "vpc_cidr" {
  value = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  value = {
    for k, subnet in aws_subnet.public :
    k => subnet.id
  }
}

output "private_app_subnet_ids" {
  value = {
    for k, subnet in aws_subnet.app :
    k => subnet.id
  }
}

output "private_db_subnet_ids" {
  value = {
    for k, subnet in aws_subnet.db :
    k => subnet.id
  }
}

output "nat_gateway_ids" {
  value = {
    for k, nat in aws_nat_gateway.main :
    k => nat.id
  }
}

output "internet_gateway_id" {
  value = aws_internet_gateway.main.id
}