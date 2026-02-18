variable "region" {
  default = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS Access Key ID"
  sensitive   = true
}

variable "aws_secret_key" {
  description = "AWS Secret Access Key"
  sensitive   = true
}
