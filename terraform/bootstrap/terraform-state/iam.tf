data "aws_iam_policy_document" "backend_access" {
  for_each = var.state_environments

  # LIST STATE OBJECTS
  statement {
    sid    = "ListTerraformState"
    effect = "Allow"

    actions = [
      "s3:ListBucket"
    ]

    resources = [
      aws_s3_bucket.terraform_state.arn
    ]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"

      values = [
        "${each.key}/*"
      ]
    }
  }

  # READ / WRITE STATE AND LOCK FILE
  statement {
    sid    = "ReadWriteTerraformState"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject"
    ]

    resources = [
      "${aws_s3_bucket.terraform_state.arn}/${each.key}/*"
    ]
  }

  # DELETE LOCK FILE ONLY
  statement {
    sid    = "DeleteTerraformLock"
    effect = "Allow"

    actions = [
      "s3:DeleteObject"
    ]

    resources = [
      "${aws_s3_bucket.terraform_state.arn}/${each.key}/*.tflock"
    ]
  }

  # KMS PERMISSIONS
  statement {
    sid    = "UseTerraformStateKMS"
    effect = "Allow"

    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:GenerateDataKey",
      "kms:DescribeKey"
    ]

    resources = [
      aws_kms_key.terraform_state.arn
    ]
  }
}

# CREATE IAM POLICIES
resource "aws_iam_policy" "backend_access" {
  for_each = var.state_environments

  name = "${var.project_name}-${each.key}-terraform-backend"

  description = "Terraform backend access for ${each.key}"

  policy = data.aws_iam_policy_document.backend_access[
    each.key
  ].json

  tags = {
    Environment = each.key
  }
}