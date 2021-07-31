set -x
SHELL_FOLDER=$(dirname "$0")
npm run build
aws s3 sync $SHELL_FOLDER/build s3://easyact.cn
aws cloudfront create-invalidation --distribution-id $cfid \
              --paths "/*"
