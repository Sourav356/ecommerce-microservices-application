resource "helm_release" "alb_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"

  namespace = "kube-system"

  values = [
    templatefile("${path.module}/values.yaml", {
      cluster_name = var.cluster_name
      region       = var.region
      role_arn     = var.alb_controller_role_arn
    })
  ]
}
