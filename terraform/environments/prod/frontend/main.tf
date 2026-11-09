data "terraform_remote_state" "application" {
  backend = "s3"

  config = {
    bucket = var.state_bucket_name
    key    = "prod/application/terraform.tfstate"
    region = var.aws_region
  }
}

module "frontend" {
  source = "../../../modules/frontend"

  name = "${var.project_name}-prod-frontend"

  alb_dns_name = (
    data.terraform_remote_state.application.outputs.alb_dns_name
  )

  force_destroy = var.force_destroy
}
