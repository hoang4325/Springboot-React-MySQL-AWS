locals {
  state_bucket_name = (
    "${var.project_name}-tfstate-${data.aws_caller_identity.current.account_id}-${var.aws_region}"
  )
}

# KMS KEY POLICY
data "aws_iam_policy_document" "kms_key" {
  statement {
    sid    = "EnableAccountIAMPermissions"
    effect = "Allow"

    principals {
      type = "AWS"

      identifiers = [
        "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
      ]
    }

    actions = [
      "kms:*"
    ]

    resources = ["*"]
  }
}


# KMS KEY
resource "aws_kms_key" "terraform_state" {
  description = "KMS key for Terraform State"

  enable_key_rotation = true

  deletion_window_in_days = 30

  policy = data.aws_iam_policy_document.kms_key.json

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "${var.project_name}-terraform-state-kms"
  }
}

# KMS ALIAS
resource "aws_kms_alias" "terraform_state" {
  name = "alias/${var.project_name}-terraform-state"

  target_key_id = aws_kms_key.terraform_state.key_id
}

# S3 BUCKET
resource "aws_s3_bucket" "terraform_state" {
  bucket = local.state_bucket_name

  force_destroy = false

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = local.state_bucket_name
    Purpose     = "Terraform Remote State"
    Environment = "Shared"
  }
}

# S3 VERSIONING
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}


# S3 SERVER-SIDE ENCRYPTION
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"

      kms_master_key_id = aws_kms_key.terraform_state.arn
    }

    bucket_key_enabled = true
  }
}


# BLOCK PUBLIC ACCESS
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}


# OWNERSHIP CONTROLS
resource "aws_s3_bucket_ownership_controls" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}


# S3 BUCKET POLICY
data "aws_iam_policy_document" "terraform_state_bucket" {
  statement {
    sid    = "DenyInsecureTransport"
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions = [
      "s3:*"
    ]

    resources = [
      aws_s3_bucket.terraform_state.arn,
      "${aws_s3_bucket.terraform_state.arn}/*"
    ]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  policy = data.aws_iam_policy_document.terraform_state_bucket.json

  depends_on = [
    aws_s3_bucket_public_access_block.terraform_state
  ]
}