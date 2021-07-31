set -x
SHELL_FOLDER=$(dirname "$0")
npm run build
aws s3 sync --debug --region $AWS_DEFAULT_REGION $SHELL_FOLDER/build s3://easyact.cn
aws cloudfront create-invalidation --debug --region $AWS_DEFAULT_REGION --distribution-id $cfid \
              --paths "/*"
