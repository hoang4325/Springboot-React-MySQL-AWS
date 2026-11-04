output "db_endpoint" {
  value = module.rds.db_endpoint
}

output "db_address" {
  value = module.rds.db_address
}

output "db_port" {
  value = module.rds.db_port
}

output "db_name" {
  value = module.rds.db_name
}

output "db_instance_arn" {
  value = module.rds.db_instance_arn
}

output "master_secret_arn" {
  value = module.rds.master_secret_arn
}