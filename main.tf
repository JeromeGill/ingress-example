provider "aws" {
  region = "us-east-1" # Replace with your preferred AWS region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.19.0"

  name = "ingres-test-jerome-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
}

# RDS (PostgreSQL)
resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "16.0"
  instance_class       = "db.t3.micro"
  name                 = "ingresdb"
  username             = "postgres"
  password             = var.db_password
  parameter_group_name = "default.postgres16"
  skip_final_snapshot  = true

  vpc_security_group_ids = [aws_security_group.rds.id]
  subnet_group_name      = aws_db_subnet_group.rds.name
}

resource "aws_db_subnet_group" "rds" {
  name       = "rds-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "rds" {
  name_prefix = "rds-sg-"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.public_subnets
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Elasticache (Redis)
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "ingres-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"

  subnet_group_name = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "redis-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "redis-sg-"

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = module.vpc.public_subnets
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Elastic Beanstalk for Node.js app
resource "aws_elastic_beanstalk_application" "app" {
  name        = "ingres-test-app"
  description = "Application for ingres test"
}

resource "aws_elastic_beanstalk_environment" "app_env" {
  name                = "ingres-test-env"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = "64bit Amazon Linux 2 v3.4.7 running Node.js 16"

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "POSTGRES_PORT"
    value     = var.postgres_port
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REDIS_PORT"
    value     = var.redis_port
  }
}

# Outputs
output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "elasticache_endpoint" {
  value = aws_elasticache_cluster.redis.configuration_endpoint_address
}
