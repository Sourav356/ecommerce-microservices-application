output "external_secrets_role_arn" {
  value = aws_iam_role.external_secrets_role.arn
}

output "external_secrets_role_name" {
  value = aws_iam_role.external_secrets_role.name
}
