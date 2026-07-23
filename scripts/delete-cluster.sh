#!/usr/bin/env bash
set -Eeuo pipefail
eksctl delete cluster -f eks/cluster.yaml --wait
echo "EKS cluster deletion completed."
