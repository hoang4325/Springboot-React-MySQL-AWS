output "db_instance_id" {
  description = "RDS DB instance identifier"
  value       = aws_db_instance.this.id
}

output "db_instance_arn" {
  description = "RDS DB instance ARN"
  value       = aws_db_instance.this.arn
}

output "db_endpoint" {
  description = "RDS DNS endpoint including port"
  value       = aws_db_instance.this.endpoint
}

output "db_address" {
  description = "RDS hostname without port"
  value       = aws_db_instance.this.address
}

output "db_port" {
  description = "RDS MySQL port"
  value       = aws_db_instance.this.port
}

output "db_name" {
  description = "Initial database name"
  value       = aws_db_instance.this.db_name
}

output "master_secret_arn" {
  description = "Secrets Manager master credential ARN"
  value       = aws_db_instance.this.master_user_secret[0].secret_arn
}