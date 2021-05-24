provider "alicloud" {
  //  region = "cn-shanghai"
  region = "cn-hangzhou"
  access_key = var.ali.ak
  secret_key = var.ali.sk
}
variable "ali" {
  default = {
    ak = ""
    sk = ""
  }
}

resource "alicloud_oss_bucket" "www" {
  bucket = "easyact-cn"
  acl = "public-read"
  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

locals {
  dist = "../../build"
  files = fileset(local.dist, "**")
  mime_types = jsondecode(file("${path.module}/../data/mime.json"))
}

resource "alicloud_oss_bucket_object" "codes" {
  for_each = local.files
  bucket = alicloud_oss_bucket.www.bucket
  key = each.key
  source = "${local.dist}/${each.key}"
  //  content_type = "text/html"
  acl = alicloud_oss_bucket.www.acl
}

output "www" {
  value = {
    s3 = alicloud_oss_bucket.www
  }
}

output "oss" {
  value = "http://${alicloud_oss_bucket.www.bucket}.${alicloud_oss_bucket.www.extranet_endpoint}"
}
