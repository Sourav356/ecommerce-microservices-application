variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "node_groups_name" {
  description = "Name for the EKS node groups"
  type        = string
}

variable "cluster_role_arn" {
  type = string
}

variable "node_role_arn" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}