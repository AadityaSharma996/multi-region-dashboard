#!/usr/bin/env bash
set -Eeuo pipefail
REGION="${AWS_REGION:-us-east-1}"
NODEGROUP_NAME="${NODEGROUP_NAME:-dashboard-node-group}"
SOURCE_CIDR="${SOURCE_CIDR:-$(curl -fsSL https://checkip.amazonaws.com)/32}"
INSTANCE_ID="$(aws ec2 describe-instances \
  --region "$REGION" \
  --filters \
    "Name=tag:eks:nodegroup-name,Values=$NODEGROUP_NAME" \
    "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text)"
if [ -z "$INSTANCE_ID" ] || [ "$INSTANCE_ID" = "None" ]; then
  echo "No running EKS node was found."
  exit 1
fi
SECURITY_GROUPS="$(aws ec2 describe-instances \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].SecurityGroups[].GroupId' \
  --output text)"
authorize_port() {
  local group_id="$1"
  local port="$2"
  local output
  local status
  set +e
  output="$(aws ec2 authorize-security-group-ingress \
    --region "$REGION" \
    --group-id "$group_id" \
    --ip-permissions \
      "IpProtocol=tcp,FromPort=$port,ToPort=$port,IpRanges=[{CidrIp=$SOURCE_CIDR}]" \
    2>&1)"
  status=$?
  set -e
  if [ "$status" -ne 0 ] && ! grep -q "InvalidPermission.Duplicate" <<<"$output"; then
    echo "$output"
    exit "$status"
  fi
}
for GROUP_ID in $SECURITY_GROUPS; do
  authorize_port "$GROUP_ID" 30080
  authorize_port "$GROUP_ID" 30030
done
echo "NodePort access is allowed from $SOURCE_CIDR."
