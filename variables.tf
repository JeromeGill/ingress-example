variable "db_password" {
  description = "The password for the RDS database"
  type        = string
}

variable "postgres_port" {
  description = "The port for the PostgreSQL database"
  type        = number
  default     = 5432
}

variable "redis_port" {
  description = "The port for the Redis database"
  type        = number
  default     = 6379
}
