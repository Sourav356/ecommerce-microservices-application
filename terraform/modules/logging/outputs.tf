output "logging_namespace" {
  value = kubernetes_namespace.logging.metadata[0].name
}