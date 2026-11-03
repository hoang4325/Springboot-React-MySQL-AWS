# DB SUBNET GROUP
resource "aws_db_subnet_group" "this" {
  name = "${var.identifier}-subnet-group"

  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.identifier}-subnet-group"
  }
}

# MYSQL PARAMETER GROUP
resource "aws_db_parameter_group" "this" {
  name   = "${var.identifier}-params"
  family = "mysql8.4"

  parameter {
    name         = "slow_query_log"
    value        = "1"
    apply_method = "immediate"
  }

  parameter {
    name         = "long_query_time"
    value        = "2"
    apply_method = "immediate"
  }

  parameter {
    name         = "log_output"
    value        = "FILE"
    apply_method = "immediate"
  }

  tags = {
    Name = "${var.identifier}-params"
  }
}

# CLOUDWATCH LOG GROUPS
resource "aws_cloudwatch_log_group" "mysql" {
  for_each = toset([
    "error",
    "slowquery"
  ])

  name = "/aws/rds/instance/${var.identifier}/${each.key}"

  retention_in_days = 30

  tags = {
    Name = "${var.identifier}-${each.key}-logs"
  }
}

# RDS MYSQL INSTANCE
resource "aws_db_instance" "this" {
  identifier = var.identifier

  # Database Engine
  engine         = "mysql"
  engine_version = var.engine_version

  instance_class = var.instance_class
  port           = 3306

  db_name  = var.db_name
  username = var.master_username

  # Storage
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage

  storage_type      = var.storage_type
  storage_encrypted = true

  # Network
  db_subnet_group_name = aws_db_subnet_group.this.name

  vpc_security_group_ids = [
    var.security_group_id
  ]

  publicly_accessible = false

  # High Availability
  multi_az = var.multi_az


  # Credentials
  manage_master_user_password = true

  # Backup
  backup_retention_period = var.backup_retention_days

  backup_window = "18:00-18:30"

  copy_tags_to_snapshot = true

  # Maintenance
  maintenance_window = "Sun:19:00-Sun:19:30"

  auto_minor_version_upgrade  = true
  allow_major_version_upgrade = false

  engine_lifecycle_support = "open-source-rds-extended-support-disabled"

  apply_immediately = false

  # Monitoring
  enabled_cloudwatch_logs_exports = [
    "error",
    "slowquery"
  ]

  parameter_group_name = aws_db_parameter_group.this.name

  # Deletion Protection
  deletion_protection = var.deletion_protection

  skip_final_snapshot = false

  final_snapshot_identifier = "${var.identifier}-final-snapshot"

  depends_on = [
    aws_cloudwatch_log_group.mysql
  ]

  tags = {
    Name = var.identifier
    Tier = "database"
  }
}