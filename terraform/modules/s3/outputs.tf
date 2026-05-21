output "bucket_name" {
  value = aws_s3_bucket.items_photos.id
}

output "bucket_arn" {
  value = aws_s3_bucket.items_photos.arn
}
