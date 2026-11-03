# VPC MODULE
module "vpc" {
  source = "../../../modules/vpc"

  name     = "${var.project_name}-prod"
  vpc_cidr = var.vpc_cidr

  availability_zones = var.availability_zones

  public_subnet_cidrs = {
    a = "10.0.1.0/24"
    b = "10.0.2.0/24"
  }

  private_app_subnet_cidrs = {
    a = "10.0.11.0/24"
    b = "10.0.12.0/24"
  }

  private_db_subnet_cidrs = {
    a = "10.0.21.0/24"
    b = "10.0.22.0/24"
  }

  single_nat_gateway = var.single_nat_gateway
}

# SECURITY GROUP MODULE
module "security_groups" {
  source = "../../../modules/security"

  name   = "${var.project_name}-prod"
  vpc_id = module.vpc.vpc_id

  app_port   = var.app_port
  db_port    = var.db_port
  admin_cidr = var.admin_cidr
}