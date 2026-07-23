#!/usr/bin/env bash
set -Eeuo pipefail
kubectl get nodes -o wide
kubectl get svc aws-dashboard-frontend-service -n dashboard
kubectl get svc monitoring-grafana -n monitoring 2>/dev/null || true
echo "Frontend NodePort: 30080"
echo "Grafana NodePort: 30030"
echo "Argo CD port-forward: kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "Argo CD password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d; echo"
echo "Grafana password: kubectl -n monitoring get secret monitoring-grafana -o jsonpath='{.data.admin-password}' | base64 -d; echo"
