# NETWORKING REMOTE STATE
data "terraform_remote_state" "networking" {
  backend = "s3"

  config = {
    bucket = var.state_bucket_name
    key    = "prod/networking/terraform.tfstate"
    region = var.aws_region
  }
}

# REGISTRY REMOTE STATE
data "terraform_remote_state" "registry" {
  backend = "s3"

  config = {
    bucket = var.state_bucket_name
    key    = "prod/registry/terraform.tfstate"
    region = var.aws_region
  }
}

# DATABASE REMOTE STATE
data "terraform_remote_state" "database" {
  backend = "s3"

  config = {
    bucket = var.state_bucket_name
    key    = "prod/database/terraform.tfstate"
    region = var.aws_region
  }
}

locals {
  name = "${var.project_name}-prod-backend"

  image_uri = "${data.terraform_remote_state.registry.outputs.repository_url}:${var.image_tag}"

  db_host = data.terraform_remote_state.database.outputs.db_address
  db_port = tostring(data.terraform_remote_state.database.outputs.db_port)
  db_name = data.terraform_remote_state.database.outputs.db_name
}

# ALB MODULE
module "alb" {
  source = "../../../modules/alb"

  name = "${var.project_name}-prod"

  vpc_id = (
    data.terraform_remote_state.networking.outputs.vpc_id
  )

  public_subnet_ids = values(
    data.terraform_remote_state.networking.outputs.public_subnet_ids
  )

  security_group_id = (
    data.terraform_remote_state.networking.outputs.alb_security_group_id
  )

  app_port          = var.app_port
  health_check_path = var.health_check_path
}

# ECS MODULE
module "ecs_service" {
  source = "../../../modules/ecs"

  name       = local.name
  aws_region = var.aws_region

  image_uri = local.image_uri

  private_subnet_ids = values(
    data.terraform_remote_state.networking.outputs.private_app_subnet_ids
  )

  security_group_id = (
    data.terraform_remote_state.networking.outputs.ecs_security_group_id
  )

  target_group_arn = module.alb.target_group_arn

  container_port = var.app_port
  desired_count  = var.desired_count

  cpu    = 256
  memory = 512

  environment = [
    {
      name  = "SPRING_PROFILES_ACTIVE"
      value = "docker"
    },
    {
      name  = "SERVER_PORT"
      value = tostring(var.app_port)
    },
    {
      name  = "DB_HOST"
      value = local.db_host
    },
    {
      name  = "DB_PORT"
      value = local.db_port
    },
    {
      name  = "DB_NAME"
      value = local.db_name
    },
    {
      name  = "DB_SSL_MODE"
      value = "REQUIRED"
    }
  ]

  secrets = [
    {
      name      = "DB_USER"
      valueFrom = "${var.app_db_secret_arn}:username::"
    },
    {
      name      = "DB_PASSWORD"
      valueFrom = "${var.app_db_secret_arn}:password::"
    }
  ]

  secret_arns = [
    var.app_db_secret_arn
  ]

  depends_on = [
    module.alb
  ]
}
