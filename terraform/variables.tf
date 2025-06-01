# AWs Region Variable
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "weather_sync" {
  description = "Weather Sync"
  type        = string
  default     = "weather_sync"
}

variable "weather_sync_domain" {
  description = "Domain for Weather Sync"
  type        = string
  default     = "weather-sync.com.br"
}

variable "product" {
  description = "Product name"
  type        = string
  default     = "Weather Sync"
}

variable "environment" {
  description = "Environment for Weather Sync"
  type        = string
  default     = "production"
}

variable "github_token" {
  description = "Github personal access token"
  type        = string
  sensitive   = true
}
variable "github_username" {
  description = "GitHub username"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "weather-sync"
}
