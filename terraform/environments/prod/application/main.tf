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

locals {
  name = "${var.project_name}-prod-backend"

  image_uri = "${data.terraform_remote_state.registry.outputs.repository_url}:${var.image_tag}"
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

  depends_on = [
    module.alb
  ]
}
