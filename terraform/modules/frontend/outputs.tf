output "s3_bucket_name" {
  description = "Private S3 bucket for React build artifacts"
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "HTTPS frontend URL"

  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}
