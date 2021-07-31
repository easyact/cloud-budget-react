set -x
SHELL_FOLDER=$(dirname "$0")
region=${AWS_DEFAULT_REGION:-cn-northwest-1}
npm run build
aws s3 sync --region $region $SHELL_FOLDER/build s3://easyact.cn
aws cloudfront create-invalidation --region $region --distribution-id $cfid \
              --paths "/*"
