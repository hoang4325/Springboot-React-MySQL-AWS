resource "aws_sns_topic" "db_alerts" {
  name = "${var.project_name}-prod-db-alerts"
}

resource "aws_sns_topic_subscription" "db_email" {
  topic_arn = aws_sns_topic.db_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-prod-mysql-cpu-high"
  namespace           = "AWS/RDS"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 60
  evaluation_periods  = 5
  threshold           = 80
  comparison_operator = "GreaterThanOrEqualToThreshold"
  dimensions = {
    DBInstanceIdentifier = module.rds.db_instance_id
  }
  alarm_actions = [aws_sns_topic.db_alerts.arn]
  ok_actions    = [aws_sns_topic.db_alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "rds_free_storage" {
  alarm_name          = "${var.project_name}-prod-mysql-low-storage"
  namespace           = "AWS/RDS"
  metric_name         = "FreeStorageSpace"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 2
  threshold           = 5368709120 # 5 GiB in bytes
  comparison_operator = "LessThanOrEqualToThreshold"
  dimensions = {
    DBInstanceIdentifier = module.rds.db_instance_id
  }
  alarm_actions = [aws_sns_topic.db_alerts.arn]
  ok_actions    = [aws_sns_topic.db_alerts.arn]
}
