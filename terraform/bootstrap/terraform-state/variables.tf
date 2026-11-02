variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "myapp"

  validation {
    condition = (
      can(regex("^[a-z0-9]+(-[a-z0-9]+)*$", var.project_name))
      && length(var.project_name) <= 16
    )

    error_message = "Use up to 16 lowercase letters, numbers or hyphens."
  }
}

variable "state_environments" {
  description = "Environments allowed to use state bucket"

  type = set(string)

  default = [
    "dev",
    "staging",
    "prod"
  ]

  validation {
    condition = alltrue([
      for env in var.state_environments :
      contains(["dev", "staging", "prod"], env)
    ])

    error_message = "Only dev, staging and prod are supported."
  }
}