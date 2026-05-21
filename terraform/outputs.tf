########################################
# NETWORK OUTPUTS
########################################

output "vpc_id" {
  description = "VPC ID"

  value = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"

  value = module.network.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"

  value = module.network.private_subnet_ids
}

########################################
# EKS OUTPUTS
########################################

output "eks_cluster_name" {
  description = "EKS Cluster Name"

  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS Cluster Endpoint"

  value = module.eks.cluster_endpoint
}

output "eks_oidc_issuer" {
  description = "EKS OIDC Issuer URL"

  value = module.eks.oidc_issuer
}

output "eks_oidc_provider_arn" {
  description = "EKS OIDC Provider ARN"

  value = module.eks.oidc_provider_arn
}

########################################
# IAM / IRSA OUTPUTS
########################################

output "irsa_role_arn" {
  description = "IRSA Role ARN"

  value = module.irsa.irsa_role_arn
}

output "alb_controller_role_arn" {
  description = "ALB Controller Role ARN"

  value = module.irsa.alb_controller_role_arn
}

output "external_secrets_irsa_role_arn" {
  description = "External Secrets IRSA Role ARN"

  value = module.external_secrets_irsa.external_secrets_role_arn
}

########################################
# LOAD BALANCER OUTPUTS
########################################

output "alb_controller_namespace" {
  description = "AWS Load Balancer Controller Namespace"

  value = module.load_balancer.alb_controller_namespace
}

########################################
# RDS OUTPUTS
########################################

output "rds_endpoint" {
  description = "PostgreSQL RDS Endpoint"

  value = module.rds.db_instance_endpoint
}

output "rds_port" {
  description = "PostgreSQL RDS Port"

  value = module.rds.db_instance_port
}

output "rds_db_name" {
  description = "PostgreSQL Database Name"

  value = module.rds.db_instance_name
}

########################################
# ECR OUTPUTS
########################################

output "ecr_repository_urls" {
  description = "ECR Repository URLs"

  value = module.ecr.repository_urls
}

########################################
# GITHUB OIDC OUTPUTS
########################################

output "github_actions_role_arn" {
  description = "GitHub Actions IAM Role ARN"

  value = module.github-oidc.github_oidc_provider_arn
}

########################################
# ARGOCD OUTPUTS
########################################

output "argocd_namespace" {
  description = "ArgoCD Namespace"

  value = module.argocd.argocd_namespace
}

########################################
# MONITORING OUTPUTS
########################################

output "monitoring_namespace" {
  description = "Monitoring Namespace"

  value = module.monitoring.monitoring_namespace
}

########################################
# LOGGING OUTPUTS
########################################

output "logging_namespace" {
  description = "Logging Namespace"

  value = module.logging.logging_namespace
}

########################################
# SECRETS MANAGER OUTPUTS
########################################

output "secret_arn" {
  description = "AWS Secrets Manager Secret ARN"

  value = aws_secretsmanager_secret.app_secret.arn
}

output "secret_name" {
  description = "AWS Secrets Manager Secret Name"

  value = aws_secretsmanager_secret.app_secret.name
}

########################################
# S3 OUTPUTS
########################################

output "s3_bucket_name" {
  description = "S3 Bucket Name"

  value = module.s3.bucket_name
}