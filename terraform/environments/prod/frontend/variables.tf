variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project_name" {
  type    = string
  default = "myapp"
}

variable "state_bucket_name" {
  description = "Existing S3 Terraform state bucket"
  type        = string
}

variable "force_destroy" {
  type    = bool
  default = true
}

