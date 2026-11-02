output "state_bucket_name" {
  description = "Terraform State S3 bucket"

  value = aws_s3_bucket.terraform_state.id
}

output "state_bucket_arn" {
  description = "Terraform State bucket ARN"

  value = aws_s3_bucket.terraform_state.arn
}

output "kms_key_arn" {
  description = "KMS key ARN"

  value = aws_kms_key.terraform_state.arn
}

output "kms_alias" {
  description = "KMS alias"

  value = aws_kms_alias.terraform_state.name
}

output "aws_account_id" {
  description = "AWS Account ID"

  value = data.aws_caller_identity.current.account_id
}

output "backend_policy_arns" {
  description = "Backend IAM policies"

  value = {
    for env, policy in aws_iam_policy.backend_access :
    env => policy.arn
  }
}