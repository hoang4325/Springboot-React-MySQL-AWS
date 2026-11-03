# SECURITY GROUPS
resource "aws_security_group" "alb" {
  name        = "${var.name}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.name}-alb-sg"
  }
}

resource "aws_security_group" "ecs" {
  name        = "${var.name}-ecs-sg"
  description = "Security group for ECS"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.name}-ecs-sg"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.name}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.name}-rds-sg"
  }
}

resource "aws_security_group" "bastion" {
  name        = "${var.name}-bastion-sg"
  description = "Security group for Bastion"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.name}-bastion-sg"
  }
}

# ALB RULES
resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 80
  to_port     = 80
  ip_protocol = "tcp"

  description = "HTTP from Internet"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id

  cidr_ipv4   = "0.0.0.0/0"
  from_port   = 443
  to_port     = 443
  ip_protocol = "tcp"

  description = "HTTPS from Internet"
}

resource "aws_vpc_security_group_egress_rule" "alb_to_ecs" {
  security_group_id = aws_security_group.alb.id

  referenced_security_group_id = aws_security_group.ecs.id

  from_port   = var.app_port
  to_port     = var.app_port
  ip_protocol = "tcp"

  description = "ALB to ECS"
}

# ECS RULES
resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id = aws_security_group.ecs.id

  referenced_security_group_id = aws_security_group.alb.id

  from_port   = var.app_port
  to_port     = var.app_port
  ip_protocol = "tcp"

  description = "ECS traffic from ALB"
}

resource "aws_vpc_security_group_egress_rule" "ecs_outbound" {
  security_group_id = aws_security_group.ecs.id

  cidr_ipv4   = "0.0.0.0/0"
  ip_protocol = "-1"

  description = "ECS outbound traffic"
}

# RDS RULES
resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {
  security_group_id = aws_security_group.rds.id

  referenced_security_group_id = aws_security_group.ecs.id

  from_port   = var.db_port
  to_port     = var.db_port
  ip_protocol = "tcp"

  description = "MySQL from ECS"
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_bastion" {
  security_group_id = aws_security_group.rds.id

  referenced_security_group_id = aws_security_group.bastion.id

  from_port   = var.db_port
  to_port     = var.db_port
  ip_protocol = "tcp"

  description = "MySQL from Bastion"
}

# BASTION RULES
resource "aws_vpc_security_group_ingress_rule" "bastion_ssh" {
  count = var.admin_cidr == null ? 0 : 1

  security_group_id = aws_security_group.bastion.id

  cidr_ipv4   = var.admin_cidr
  from_port   = 22
  to_port     = 22
  ip_protocol = "tcp"

  description = "SSH from trusted admin IP"
}

resource "aws_vpc_security_group_egress_rule" "bastion_to_rds" {
  security_group_id = aws_security_group.bastion.id

  referenced_security_group_id = aws_security_group.rds.id

  from_port   = var.db_port
  to_port     = var.db_port
  ip_protocol = "tcp"

  description = "Bastion to RDS"
}