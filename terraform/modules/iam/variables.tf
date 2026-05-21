variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "node_groups_name" {
  description = "Name for the eks node groups"
  type        = string
}

variable "github_oidc_provider_arn" {
  type = string
}

variable "github_repo" {
  type = string
}
