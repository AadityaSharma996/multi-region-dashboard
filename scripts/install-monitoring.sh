#!/usr/bin/env bash
set -Eeuo pipefail
CLUSTER_NAME="${EKS_CLUSTER_NAME:-multi-region-dashboard}"
REGION="${AWS_REGION:-us-east-1}"
aws eks update-kubeconfig --name "$CLUSTER_NAME" --region "$REGION"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --version 86.0.0 \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/kube-prometheus-stack-values.yaml \
  --wait \
  --timeout 15m
echo "Prometheus and Grafana are installed."
