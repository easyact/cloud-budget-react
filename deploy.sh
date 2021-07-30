set -x
SHELL_FOLDER=$(dirname "$0")
REGION=' --region cn-northwest-1 '
npm run build
aws s3 sync $SHELL_FOLDER/build $REGION s3://easyact.cn
aws cloudfront create-invalidation --distribution-id $cfid \
              $REGION --paths "/*"
