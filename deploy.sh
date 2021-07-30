set -x
SHELL_FOLDER=$(dirname "$0")
echo $AWS_DEFAULT_REGION $AWS_ACCESS_KEY_ID	$AWS_SECRET_ACCESS_KEY
npm run build
aws s3 sync $SHELL_FOLDER/build s3://easyact.cn
aws cloudfront create-invalidation --distribution-id $cfid \
              --paths "/*"
