set -x
SHELL_FOLDER=$(dirname "$0")
npm run build
aws s3 sync --debug $SHELL_FOLDER/build s3://easyact.cn
aws cloudfront create-invalidation --debug --distribution-id $cfid \
              --paths "/*"
