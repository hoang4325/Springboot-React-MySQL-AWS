variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project_name" {
  type    = string
  default = "myapp"
}

variable "state_bucket_name" {
  type = string
}

variable "image_tag" {
  type = string
}

variable "app_port" {
  type    = number
  default = 8080
}

variable "health_check_path" {
  type    = string
  default = "/actuator/health"
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "app_db_secret_arn" {
  description = "Secrets Manager ARN containing application DB credentials"
  type        = string

  validation {
    condition     = length(trimspace(var.app_db_secret_arn)) > 0
    error_message = "Application database secret ARN is required."
  }
}

