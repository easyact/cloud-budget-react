resource "aws_sqs_queue" "es" {
  name = "es"
}

resource "aws_iam_policy" "apig_sqs_policy" {
  name = "apig_sqs_policy"
  policy = file("policy-apig-sqs.json")
}

resource "aws_iam_role" "apig_sqs" {
  name = "apig_sqs"
  assume_role_policy = data.aws_iam_policy_document.apig_sqs.json
  managed_policy_arns = [
    aws_iam_policy.apig_sqs_policy.arn]
}

data "aws_iam_policy_document" "apig_sqs" {
  statement {
    actions = [
      "sts:AssumeRole"]
    principals {
      identifiers = [
        "apigateway.amazonaws.com"]
      type = "Service"
    }
  }
}

data "aws_iam_policy_document" "apig_dbd" {
  statement {
    actions = [
      "dynamodb:PutItem"]
    resources = ["arn:aws-cn:dynamodb:cn-northwest-1:020064664914:table/events"]
  }
}

resource "aws_iam_policy" "apig_dbd" {
  name = "apig_dbd_policy"
  policy = data.aws_iam_policy_document.apig_dbd.json
}

resource "aws_iam_role" "apig_dbd" {
  name = "apig_dbd"
  assume_role_policy = data.aws_iam_policy_document.apig_sqs.json
  managed_policy_arns = [
    aws_iam_policy.apig_dbd.arn]
}

output "api" {
  value = {
    sqs = aws_sqs_queue.es
    role = [aws_iam_role.apig_sqs.arn, aws_iam_role.apig_dbd.arn]
  }
}
