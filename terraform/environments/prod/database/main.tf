# READ NETWORKING STATE
data "terraform_remote_state" "networking" {
  backend = "s3"

  config = {
    bucket = "myapp-tfstate-051374769054-ap-southeast-1"

    key = "prod/networking/terraform.tfstate"

    region = "ap-southeast-1"
  }
}

# RDS MODULE
module "rds" {
  source = "../../../modules/rds"

  identifier = "${var.project_name}-prod-mysql"

  db_name = var.db_name

  instance_class = var.db_instance_class

  engine_version = "8.4"

  allocated_storage = var.db_allocated_storage

  max_allocated_storage = var.db_max_allocated_storage

  multi_az = var.db_multi_az

  storage_type = var.db_storage_type

  backup_retention_days = var.db_backup_retention_days

  deletion_protection = false

  subnet_ids = values(
    data.terraform_remote_state.networking.outputs.private_db_subnet_ids
  )

  security_group_id = (
    data.terraform_remote_state.networking.outputs.rds_security_group_id
  )
}