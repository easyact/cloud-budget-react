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

//resource "aws_iam_role_policy_attachment" "apig_sqs" {
//  policy_arn = aws_iam_policy.apig_sqs_policy.arn
//  role = aws_iam_role.apig_sqs.arn
//}

output "api" {
  value = {
    sqs = aws_sqs_queue.es
    role = aws_iam_role.apig_sqs.arn
  }
}
