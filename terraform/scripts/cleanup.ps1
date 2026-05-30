kubectl delete ingress --all -A

kubectl delete svc --all -A

helm uninstall argocd -n argocd

helm uninstall kube-prometheus-stack -n monitoring

helm uninstall loki -n logging

kubectl delete ns argocd

kubectl delete ns monitoring

kubectl delete ns logging