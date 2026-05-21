output "cluster_role_arn" {
  value = aws_iam_role.ecommerce-eks-cluster-role.arn
}

output "node_role_arn" {
  value = aws_iam_role.eks-node-group-role.arn
}

output "ecr_policy_arn" {
  value = aws_iam_policy.ecr.arn
}

output "external_secrets_policy_arn" {
  value = aws_iam_policy.external_secrets_policy.arn
}