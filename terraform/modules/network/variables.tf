variable "vpc_cidr" {
  description = "CIDR block for the vpc"
  type        = string
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "ecommerce-eks-cluster"
}

variable "availability_zones" {
  description = "Availability zones for subnets"
  type        = list(string)
}