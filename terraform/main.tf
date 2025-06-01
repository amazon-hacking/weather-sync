terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}


resource "aws_security_group" "weather_sync_security_group" {
  name        = "weather_sync_security_group"
  description = "Security group for the weather sync server"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "weather_sync_server" {
  ami           = "ami-06c8f2ec674c67112"
  instance_type = "t2.nano"

  user_data = file("user_data.sh")

  vpc_security_group_ids = [aws_security_group.weather_sync_security_group.id]
}

