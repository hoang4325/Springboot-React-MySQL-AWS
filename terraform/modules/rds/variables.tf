variable "identifier" {
  description = "Unique RDS instance identifier"
  type        = string
}

variable "subnet_ids" {
  description = "Private DB subnets in different AZs"
  type        = list(string)

  validation {
    condition     = length(distinct(var.subnet_ids)) >= 2
    error_message = "At least two different DB subnets are required."
  }
}

variable "security_group_id" {
  description = "Security Group for RDS"
  type        = string
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "appdb"
}

variable "master_username" {
  description = "Master administrator username"
  type        = string
  default     = "dbadmin"
}

variable "engine_version" {
  description = "MySQL major engine version"
  type        = string
  default     = "8.4"
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.medium"
}

variable "allocated_storage" {
  description = "Initial storage capacity in GiB"
  type        = number
  default     = 30
}

variable "max_allocated_storage" {
  description = "Storage autoscaling upper limit in GiB"
  type        = number
  default     = 100
}

variable "multi_az" {
  description = "Enable RDS Multi-AZ"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Automated backup retention in days"
  type        = number
  default     = 7

  validation {
    condition = (
      var.backup_retention_days >= 1 &&
      var.backup_retention_days <= 35
    )
    error_message = "Backup retention must be between 1 and 35 days."
  }
}

variable "deletion_protection" {
  description = "Prevent accidental RDS deletion"
  type        = bool
  default     = true
}

variable "storage_type" {
  description = "RDS storage type"
  type        = string
  default     = "gp3"
}