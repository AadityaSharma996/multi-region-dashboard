#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${1:-$(pwd)}"
cd "$ROOT"

echo "Starting preflight validation."

required=(
  Jenkins-CI
  gitops/Jenkins-CD
  eks/cluster.yaml
  argocd/dashboard-application.yaml
  k8s/base/namespace.yaml
  k8s/base/backend-deployment.yaml
  k8s/base/backend-service.yaml
  k8s/base/frontend-deployment.yaml
  k8s/base/frontend-service.yaml
  k8s/base/kustomization.yaml
  k8s/overlays/production/kustomization.yaml
  frontend/nginx.conf
)

for file in "${required[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing file: $file"
    exit 1
  fi
done

echo "Required files are present."

for tool in git kubectl eksctl; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool"
    exit 1
  fi
done

echo "Required tools are installed."

rendered_file="$(mktemp)"
eks_file="$(mktemp)"

trap 'rm -f "$rendered_file" "$eks_file"' EXIT

if command -v kustomize >/dev/null 2>&1; then
  kustomize build k8s/overlays/production > "$rendered_file"
else
  kubectl kustomize k8s/overlays/production > "$rendered_file"
fi

if [[ ! -s "$rendered_file" ]]; then
  echo "Kustomize rendered an empty file."
  exit 1
fi

deployment_count="$(grep -c '^kind: Deployment$' "$rendered_file" || true)"
service_count="$(grep -c '^kind: Service$' "$rendered_file" || true)"
namespace_count="$(grep -c '^kind: Namespace$' "$rendered_file" || true)"

if [[ "$deployment_count" -ne 2 ]]; then
  echo "Expected 2 Deployments, found $deployment_count."
  exit 1
fi

if [[ "$service_count" -ne 2 ]]; then
  echo "Expected 2 Services, found $service_count."
  exit 1
fi

if [[ "$namespace_count" -ne 1 ]]; then
  echo "Expected 1 Namespace, found $namespace_count."
  exit 1
fi

grep -Fq 'name: aws-dashboard-backend' "$rendered_file"
grep -Fq 'name: aws-dashboard-frontend' "$rendered_file"
grep -Fq 'name: aws-dashboard-backend-service' "$rendered_file"
grep -Fq 'name: aws-dashboard-frontend-service' "$rendered_file"
grep -Fq 'nodePort: 30080' "$rendered_file"
grep -Fq 'namespace: dashboard' "$rendered_file"

echo "Kubernetes manifests rendered successfully."

eksctl create cluster \
  -f eks/cluster.yaml \
  --dry-run > "$eks_file"

if [[ ! -s "$eks_file" ]]; then
  echo "EKS dry-run returned an empty configuration."
  exit 1
fi

echo "EKS configuration passed dry-run validation."

if ! grep -Fq \
  'proxy_pass http://aws-dashboard-backend-service:4000' \
  frontend/nginx.conf; then
  echo "Frontend Nginx backend address is incorrect."
  exit 1
fi

echo "Frontend Nginx backend address is correct."

git diff --check

if git ls-files | grep -Eq \
  '(^|/)\.env$|\.pem$|(^|/)terra-key(\.pub)?$|(^|/)terraform\.tfstate(\..*)?$'; then
  echo "A sensitive file is tracked by Git."
  git ls-files | grep -E \
    '(^|/)\.env$|\.pem$|(^|/)terra-key(\.pub)?$|(^|/)terraform\.tfstate(\..*)?$'
  exit 1
fi

echo "Git checks passed."
echo "Preflight validation passed."
echo "No AWS infrastructure was created."
