output "db_instance_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "rds_address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.main.address
}

output "db_instance_name" {
  description = "The name of the RDS instance"
  value       = aws_db_instance.main.db_name
}

output "db_instance_port" {
  description = "The port for the RDS instance"
  value       = aws_db_instance.main.port
}

output "db_instance_id" {
  description = "The RDS instance ID"
  value       = aws_db_instance.main.id
}
