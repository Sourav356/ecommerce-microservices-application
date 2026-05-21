terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}

data "aws_eks_cluster_auth" "eks" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  host = module.eks.cluster_endpoint

  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  token = data.aws_eks_cluster_auth.eks.token
}

provider "helm" {
  kubernetes {

    host = module.eks.cluster_endpoint

    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    token = data.aws_eks_cluster_auth.eks.token
  }
}


module "network" {
  source = "./modules/network"

  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

module "iam" {
  source = "./modules/iam"

  cluster_name             = var.cluster_name
  node_groups_name         = var.node_groups_name
  github_oidc_provider_arn = module.github-oidc.github_oidc_provider_arn

  github_repo = var.github_repo

}

module "eks" {
  source = "./modules/eks"

  cluster_name     = var.cluster_name
  node_groups_name = var.node_groups_name
  cluster_role_arn = module.iam.cluster_role_arn
  node_role_arn    = module.iam.node_role_arn
  subnet_ids       = module.network.private_subnet_ids
}


module "irsa" {
  source = "./modules/irsa"

  oidc_issuer          = module.eks.oidc_issuer
  oidc_provider_arn    = module.eks.oidc_provider_arn
  service_account_name = "my-service-account"
  namespace            = "default"
  policy_arn           = module.iam.ecr_policy_arn
}

module "external_secrets_irsa" {
  source = "./modules/external_secrets_irsa"

  oidc_issuer       = module.eks.oidc_issuer
  oidc_provider_arn = module.eks.oidc_provider_arn

  namespace            = "external-secrets"
  service_account_name = "external-secrets-sa"

  policy_arn = module.iam.external_secrets_policy_arn
}

module "load_balancer" {
  source = "./modules/load-balancer"

  alb_controller_role_arn = module.irsa.alb_controller_role_arn
  cluster_name            = module.eks.cluster_name
  region                  = var.aws_region
  oidc_issuer             = replace(module.eks.oidc_issuer, "https://", "")
  oidc_provider_arn       = module.eks.oidc_provider_arn

  depends_on = [
    module.eks,
    module.irsa
  ]
}

module "s3" {
  source = "./modules/s3"

  bucket_name = var.bucket_name
}

module "rds" {
  source = "./modules/rds"

  db_name            = var.db_name
  db_user            = var.db_user
  db_password        = var.db_password
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  eks_security_group = module.eks.cluster_security_group_id


}

module "ecr" {
  source = "./modules/ecr"

  environment = var.environment

  repository_names = var.repository_names
}

module "github-oidc" {
  source = "./modules/github-oidc"
}

module "argocd" {

  source = "./modules/argocd"

  cluster_name = module.eks.cluster_name

  argocd_namespace = "argocd"

  github_repo_url = var.github_repo

  github_branch = "main"

  app_path = "k8s-helm/ecommerce-app"

  argocd_chart_version = "7.7.11"

  depends_on = [
    module.eks 
  ]
}

module "secrets-manager" {

  source = "./modules/secrets-manager"

  environment = var.environment

  db_password = var.db_password

  admin_password = var.admin_password

  db_url = var.db_url
}

module "monitoring" {
  source = "./modules/monitoring"

  depends_on = [
    module.eks 
  ]
}

module "logging" {
  source = "./modules/logging"

  depends_on = [
    module.eks 
  ]
}