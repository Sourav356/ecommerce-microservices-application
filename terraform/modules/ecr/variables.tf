variable "repository_names" {
  description = "A list of ECR repository names."
  type        = list(string)
}

variable "environment" {
  description = "The environment tag for the ECR repositories."
  type        = string
}