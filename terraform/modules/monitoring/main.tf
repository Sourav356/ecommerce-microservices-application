resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "kube_prometheus_stack" {
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"

  namespace = kubernetes_namespace.monitoring.metadata[0].name

  create_namespace = false

  timeout    = 900
  wait              = true
  

  values = [
    file("${path.module}/values.yaml")
  ]

}