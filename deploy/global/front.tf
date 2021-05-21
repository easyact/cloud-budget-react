provider "aws" {
  region = "ap-southeast-1"
}
resource "aws_s3_bucket" "www" {
  bucket = "b.easyact.cn"
  acl = "public-read"
  policy = file("policy.json")
  website {
    index_document = "index.html"
  }
}

locals {
  dist = "../../build"
  files = fileset(local.dist, "**")
  mime_types = jsondecode(file("${path.module}/../data/mime.json"))
}

resource "aws_s3_bucket_object" "files" {
  for_each = local.files
  bucket = aws_s3_bucket.www.bucket
  key = each.key
  source = "${local.dist}/${each.key}"
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.key), "binary/octet-stream")
  //  acl =
}

output "www" {
  value = {
    s3 = aws_s3_bucket.www
  }
}
