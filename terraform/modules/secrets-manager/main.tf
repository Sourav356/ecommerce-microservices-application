resource "aws_secretsmanager_secret" "app_secret" {

  name = "ecommerce-app-secrets-prod"

  tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_secretsmanager_secret_version" "app_secret_value" {

  secret_id = aws_secretsmanager_secret.app_secret.id

  secret_string = jsonencode({

    DB_PASS = var.db_password

    ADMIN_PASSWORD = var.admin_password

    DB_URL = var.db_url
  })
}