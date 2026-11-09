locals {
  s3_origin_id  = "frontend-s3"
  api_origin_id = "backend-alb"
}

# PRIVATE S3 BUCKET
resource "aws_s3_bucket" "frontend" {
  bucket_prefix = "${var.name}-"
  force_destroy = var.force_destroy

  tags = {
    Name = "${var.name}-assets"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ORIGIN ACCESS CONTROL
resource "aws_cloudfront_origin_access_control" "frontend" {
  name = "${var.name}-oac"

  description = "OAC for ${var.name} private S3 origin"

  origin_access_control_origin_type = "s3"

  signing_behavior = "always"
  signing_protocol = "sigv4"
}

# REACT SPA ROUTING
resource "aws_cloudfront_function" "spa_rewrite" {
  name = "${var.name}-spa-rewrite"

  runtime = "cloudfront-js-1.0"
  comment = "Rewrite React Router paths to /index.html"
  publish = true

  code = file("${path.module}/spa-rewrite.js")
}

# CLOUDFRONT DISTRIBUTION
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.name} React frontend and backend API"
  default_root_object = "index.html"
  price_class         = var.price_class

  # S3 ORIGIN
  origin {
    domain_name = (
      aws_s3_bucket.frontend.bucket_regional_domain_name
    )

    origin_id = local.s3_origin_id

    origin_access_control_id = (
      aws_cloudfront_origin_access_control.frontend.id
    )
  }

  # EXISTING ALB ORIGIN
  origin {
    domain_name = var.alb_dns_name
    origin_id   = local.api_origin_id

    custom_origin_config {
      http_port  = 80
      https_port = 443

      # Existing ALB currently uses HTTP listener
      origin_protocol_policy = "http-only"

      origin_ssl_protocols = ["TLSv1.2"]
    }
  }

  # DEFAULT BEHAVIOR: REACT ON S3
  default_cache_behavior {
    target_origin_id = local.s3_origin_id

    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    compress = true

    # AWS Managed CachingOptimized
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    function_association {
      event_type = "viewer-request"

      function_arn = aws_cloudfront_function.spa_rewrite.arn
    }
  }

  # API BEHAVIOR: ALB -> ECS
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = local.api_origin_id

    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "POST",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    compress = true

    # AWS Managed CachingDisabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"

    # Forward headers except Host, all cookies and query strings
    origin_request_policy_id = "b689b0a8-53d0-40ab-baf2-68738e2966ac"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${var.name}-cloudfront"
  }
}

# S3 BUCKET POLICY
data "aws_iam_policy_document" "frontend_oac" {
  statement {
    sid    = "AllowCloudFrontRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = ["s3:GetObject"]

    resources = [
      "${aws_s3_bucket.frontend.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        aws_cloudfront_distribution.frontend.arn
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = data.aws_iam_policy_document.frontend_oac.json

  depends_on = [
    aws_s3_bucket_public_access_block.frontend
  ]
}
