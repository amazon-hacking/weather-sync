#!/bin/bash

sudo su
yum update -y
yum install -y docker
service docker start
usermod -aG docker ec2-user


docker run -p 80:8080 weather-sync-container:latest