variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "project_name" {
  type    = string
  default = "myapp"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "availability_zones" {
  type = map(string)
}

variable "single_nat_gateway" {
  type    = bool
  default = false
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
  type    = string
  default = null
}