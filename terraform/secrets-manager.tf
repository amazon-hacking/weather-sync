resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.app_name}-db-credentials"
  description = "Database credentials for ${var.app_name} in ${var.environment} environment"

  tags = {
    Environment = var.environment
    Product     = var.product
  }
}


resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
  min_upper        = 2
  min_lower        = 2
  min_numeric      = 2
  min_special      = 2
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_credentials.id
  secret_string = random_password.db_password.result
}

resource "aws_secretsmanager_secret_version" "github_credentials" {

  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.github_username
    password = var.github_token
  })
}
