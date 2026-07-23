#!/usr/bin/env bash
set -Eeuo pipefail
CLUSTER_NAME="${EKS_CLUSTER_NAME:-multi-region-dashboard}"
REGION="${AWS_REGION:-us-east-1}"
aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$REGION"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply --server-side --force-conflicts -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl rollout status deployment/argocd-server -n argocd --timeout=600s
kubectl apply -f argocd/dashboard-application.yaml
echo "Argo CD and the dashboard application are installed."
