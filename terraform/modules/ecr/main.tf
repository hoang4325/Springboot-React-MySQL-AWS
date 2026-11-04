# ECR REPOSITORY
resource "aws_ecr_repository" "this" {
  name = var.repository_name

  image_tag_mutability = "IMMUTABLE"

  force_delete = false

  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = var.repository_name
  }
}

# ECR LIFECYCLE POLICY
resource "aws_ecr_lifecycle_policy" "this" {
  repository = aws_ecr_repository.this.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1

        description = "Delete untagged images after retention period"

        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = var.untagged_retention_days
        }

        action = {
          type = "expire"
        }
      }
    ]
  })
}