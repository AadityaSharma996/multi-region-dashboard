output "ec2_public_ip" {
  value = aws_instance.dashboard_ec2.public_ip
}

output "s3_bucket_name" {
  value = aws_s3_bucket.dashboard_bucket.bucket
}
