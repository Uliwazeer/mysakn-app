terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region     = var.region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

module "network" {
  source = "./network"
  region = var.region
}

module "eks_cluster" {
  source     = "./eks"
  vpc_id     = module.network.vpc_id
  subnet_ids = module.network.subnet_ids
  cluster_name = "mysakn-cluster"
}

module "jenkins_server" {
  source    = "./jenkins"
  vpc_id    = module.network.vpc_id
  subnet_id = module.network.public_subnet_id
  instance_type = "t3.medium"
}
