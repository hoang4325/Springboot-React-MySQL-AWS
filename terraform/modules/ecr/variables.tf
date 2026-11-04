variable "repository_name" {
  description = "Name of ECR repository"
  type        = string
}

variable "scan_on_push" {
  description = "Enable image vulnerability scanning"
  type        = bool
  default     = true
}

variable "untagged_retention_days" {
  description = "Days to keep untagged images"
  type        = number
  default     = 14

  validation {
    condition     = var.untagged_retention_days >= 1
    error_message = "Retention must be at least 1 day."
  }
}