variable "name" {
  description = "Resource name prefix"
  type        = string
}

variable "vpc_cidr" {
  type = string
}

variable "availability_zones" {
  description = "Map of availability zones: a and b"
  type        = map(string)
}

variable "public_subnet_cidrs" {
  type = map(string)
}

variable "private_app_subnet_cidrs" {
  type = map(string)
}

variable "private_db_subnet_cidrs" {
  type = map(string)
}

variable "single_nat_gateway" {
  description = "Use one NAT instead of two"
  type        = bool
  default     = false
}