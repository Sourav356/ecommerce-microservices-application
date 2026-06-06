resource "aws_eks_access_entry" "sourav_admin" {
  cluster_name  = aws_eks_cluster.eks-cluster.name

  principal_arn = "arn:aws:iam::637043415174:user/sourav_admin"

  type = "STANDARD"
}

resource "aws_eks_access_policy_association" "sourav_admin_admin" {
  cluster_name  = aws_eks_cluster.eks-cluster.name

  principal_arn = "arn:aws:iam::637043415174:user/sourav_admin"

  policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}