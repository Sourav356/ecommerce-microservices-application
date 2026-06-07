resource "kubernetes_namespace" "argocd" {
  metadata {
    name = var.argocd_namespace
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  namespace  = kubernetes_namespace.argocd.metadata[0].name
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "7.0.0"

  set {
    name  = "configs.params.server\\.insecure"
    value = "true"
  }

  create_namespace = false

  timeout = 900

}

resource "kubernetes_ingress_v1" "argocd" {
  metadata {
    name      = "argocd-ingress"
    namespace = kubernetes_namespace.argocd.metadata[0].name

    annotations = {

      "kubernetes.io/ingress.class" = "alb"

      "alb.ingress.kubernetes.io/scheme"      = "internet-facing"
      "alb.ingress.kubernetes.io/target-type" = "ip"

      "alb.ingress.kubernetes.io/backend-protocol" = "HTTP"

      "alb.ingress.kubernetes.io/healthcheck-path" = "/"

      "alb.ingress.kubernetes.io/success-codes" = "200,307"

    }
  }

  spec {

    ingress_class_name = "alb"
    
    rule {
      http {
        path {
          path      = "/"
          path_type = "Prefix"

          backend {
            service {
              name = "argocd-server"
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}


# resource "kubernetes_manifest" "ecommerce_app" {
#   depends_on = [helm_release.argocd]

#   # Looks directly in the same folder where this main.tf lives!
#   manifest = yamldecode(file("${path.module}/argocd-application.yaml"))
# }

