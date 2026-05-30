resource "kubernetes_namespace" "logging" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "loki" {
  name       = "loki"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "loki-stack"

  namespace = kubernetes_namespace.logging.metadata[0].name

  create_namespace = false

  timeout = 900

  values = [
    file("${path.module}/values.yaml")
  ]
}