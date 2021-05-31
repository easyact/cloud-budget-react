resource "aws_s3_bucket" "www" {
  bucket = "easyact.cn"
  acl = "public-read"
  policy = file("policy.json")
  website {
    index_document = "index.html"
  }
}

locals {
  dist = "../build"
  files = fileset(local.dist, "**")
  mime_types = jsondecode(file("${path.module}/data/mime.json"))
}

//resource "aws_s3_bucket_object" "files" {
//  for_each = local.files
//  bucket = aws_s3_bucket.www.bucket
//  key = each.key
//  source = "${local.dist}/${each.key}"
//  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.key), "binary/octet-stream")
//  //  acl =
//}

resource "null_resource" "remove_and_upload_to_s3" {
  provisioner "local-exec" {
    command = "aws s3 sync ${local.dist} s3://${aws_s3_bucket.www.bucket}"
  }
}

output "www" {
  value = {
    url = "https://${aws_s3_bucket.www.website_endpoint}"
    s3 = aws_s3_bucket.www.bucket
  }
}