variable "name" {
  description = "Prefix for frontend resources"
  type        = string
}

variable "alb_dns_name" {
  description = "Existing ALB DNS name without http://"
  type        = string
}

variable "force_destroy" {
  description = "Delete S3 objects when destroying the lab"
  type        = bool
  default     = true
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "origin_verify_secret" {
  description = "Shared secret header sent from CloudFront to ALB"
  type        = string
  sensitive   = true
}
