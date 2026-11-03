# VPC OUTPUTS
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "vpc_cidr" {
  value = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_app_subnet_ids" {
  value = module.vpc.private_app_subnet_ids
}

output "private_db_subnet_ids" {
  value = module.vpc.private_db_subnet_ids
}

output "nat_gateway_ids" {
  value = module.vpc.nat_gateway_ids
}

output "internet_gateway_id" {
  value = module.vpc.internet_gateway_id
}

# SECURITY GROUP OUTPUTS
output "alb_security_group_id" {
  value = module.security_groups.alb_sg_id
}

output "ecs_security_group_id" {
  value = module.security_groups.ecs_sg_id
}

output "rds_security_group_id" {
  value = module.security_groups.rds_sg_id
}

output "bastion_security_group_id" {
  value = module.security_groups.bastion_sg_id
}