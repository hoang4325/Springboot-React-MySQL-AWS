module "backend_ecr" {
  source = "../../../modules/ecr"

  repository_name = "${var.project_name}-prod-backend"

  scan_on_push = true

  untagged_retention_days = var.untagged_retention_days
}