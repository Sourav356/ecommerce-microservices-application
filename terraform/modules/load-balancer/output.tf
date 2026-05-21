output "alb_controller_release_name" {
  description = "Helm release name of ALB Controller"
  value       = helm_release.alb_controller.name
}

output "alb_controller_namespace" {
  description = "Kubernetes namespace where ALB Controller is deployed"
  value       = helm_release.alb_controller.namespace
}