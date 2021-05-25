data "aws_api_gateway_rest_api" "es" {
  name = "es"
}

resource "aws_api_gateway_deployment" "dev" {
  rest_api_id = data.aws_api_gateway_rest_api.es.id
  stage_name = "dev"
  description = "ter"
}

output "gateway" {
  value = aws_api_gateway_deployment.dev
}
