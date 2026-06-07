variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-2"
}

variable "vpc_cidr" {
  description = "CIDR block for the vpc"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]

}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
  default     = ["ap-south-2a", "ap-south-2b"]
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "ecommerce-eks-cluster"
}

variable "node_groups_name" {
  description = "Name for the EKS node groups"
  type        = string
  default     = "ecommerce-eks-node-groups"
}

variable "db_name" {
  description = "The name of the database to create when the DB instance is created"
  type        = string

}

variable "db_user" {
  description = "Username for the master DB user"
  type        = string

}

variable "db_password" {
  description = "Password for the master DB user"
  type        = string
  sensitive   = true

}

variable "admin_password" {
  type      = string
  sensitive = true
}

variable "bucket_name" {
  description = "Name of the S3 bucket for EKS"
  type        = string
  default     = "ecommerce-eks-bucket"
}

variable "environment" {
  description = "The environment tag for the ECR repositories."
  type        = string
}

variable "repository_names" {
  description = "A list of ECR repository names."
  type        = list(string)
}

variable "github_repo" {
  description = "GitHub repository in the format 'owner/repo'"
  type        = string
}