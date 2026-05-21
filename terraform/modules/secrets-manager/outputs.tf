output "secret_name" {
  value = aws_secretsmanager_secret.app_secret.name
}

output "secret_arn" {
  value = aws_secretsmanager_secret.app_secret.arn
}