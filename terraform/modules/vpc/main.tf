# VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr

  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.name}-vpc"
  }
}

# INTERNET GATEWAY
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.name}-igw"
  }
}

# PUBLIC SUBNETS
resource "aws_subnet" "public" {
  for_each = var.public_subnet_cidrs

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = var.availability_zones[each.key]

  map_public_ip_on_launch = false

  tags = {
    Name = "${var.name}-public-${each.key}"
    Tier = "public"
  }
}

# PRIVATE APP SUBNETS
resource "aws_subnet" "app" {
  for_each = var.private_app_subnet_cidrs

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = var.availability_zones[each.key]

  map_public_ip_on_launch = false

  tags = {
    Name = "${var.name}-app-${each.key}"
    Tier = "application"
  }
}

# PRIVATE DB SUBNETS
resource "aws_subnet" "db" {
  for_each = var.private_db_subnet_cidrs

  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value
  availability_zone = var.availability_zones[each.key]

  map_public_ip_on_launch = false

  tags = {
    Name = "${var.name}-db-${each.key}"
    Tier = "database"
  }
}

# PUBLIC ROUTE TABLE
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.name}-public-rt"
  }
}

resource "aws_route" "public_internet" {
  route_table_id = aws_route_table.public.id

  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}

resource "aws_route_table_association" "public" {
  for_each = aws_subnet.public

  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

# ELASTIC IP FOR NAT GATEWAY
locals {
  nat_azs = var.single_nat_gateway ? {
    a = true
  } : {
    a = true
    b = true
  }
}

resource "aws_eip" "nat" {
  for_each = local.nat_azs

  domain = "vpc"

  tags = {
    Name = "${var.name}-nat-eip-${each.key}"
  }
}

# NAT GATEWAY
resource "aws_nat_gateway" "main" {
  for_each = local.nat_azs

  allocation_id = aws_eip.nat[each.key].id

  subnet_id = aws_subnet.public[each.key].id

  depends_on = [
    aws_route.public_internet
  ]

  tags = {
    Name = "${var.name}-nat-${each.key}"
  }
}

# APP ROUTE TABLES
resource "aws_route_table" "app" {
  for_each = aws_subnet.app

  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.name}-app-rt-${each.key}"
  }
}

resource "aws_route" "app_internet" {
  for_each = aws_route_table.app

  route_table_id = each.value.id

  destination_cidr_block = "0.0.0.0/0"

  nat_gateway_id = aws_nat_gateway.main[
    var.single_nat_gateway ? "a" : each.key
  ].id
}

resource "aws_route_table_association" "app" {
  for_each = aws_subnet.app

  subnet_id      = each.value.id
  route_table_id = aws_route_table.app[each.key].id
}

# DB ROUTE TABLES
resource "aws_route_table" "db" {
  for_each = aws_subnet.db

  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.name}-db-rt-${each.key}"
  }
}

resource "aws_route_table_association" "db" {
  for_each = aws_subnet.db

  subnet_id      = each.value.id
  route_table_id = aws_route_table.db[each.key].id
}