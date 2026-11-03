variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "app_port" {
  type    = number
  default = 8080
}

variable "db_port" {
  type    = number
  default = 3306
}

variable "admin_cidr" {
  description = "Trusted IP for Bastion SSH, null to disable"
  type        = string
  default     = null
}