resource "aws_eks_cluster" "eks-cluster" {
  name = var.cluster_name

  access_config {
  authentication_mode = "API_AND_CONFIG_MAP"

  bootstrap_cluster_creator_admin_permissions = true
}

  role_arn = var.cluster_role_arn
  version  = "1.35"

  vpc_config {
    subnet_ids = var.subnet_ids
  }

  enabled_cluster_log_types = ["api", "audit"]

}


resource "aws_eks_node_group" "eks-node-groups" {
  cluster_name    = aws_eks_cluster.eks-cluster.name
  node_group_name = var.node_groups_name
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = ["t3.large"]
  disk_size      = 20

}

resource "aws_iam_openid_connect_provider" "eks" {

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = ["9e99a48a9960b14926bb7f3b02e22da0ecd5d5f3"]

  url = aws_eks_cluster.eks-cluster.identity[0].oidc[0].issuer
}

