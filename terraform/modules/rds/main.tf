resource "aws_db_subnet_group" "main" {
  name       = "ecommerce-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "ecommerce-db-subnet-group"
  }
}


resource "aws_security_group" "rds" {
  name        = "ecommerce-rds-security-group"
  description = "Allow inbound traffic from EKS nodes"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL from EKS nodes"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.eks_security_group]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecommerce-rds-security-group"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "ecommerce-rds"
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = "db.t3.micro"
  db_name                = var.db_name
  username               = var.db_user
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name = "ecommerce-rds"
  }
}
