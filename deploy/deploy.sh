set +x
SHELL_FOLDER=$(dirname "$0")
pushd $SHELL_FOLDER/..
npm run build
popd
aws s3 sync $SHELL_FOLDER/../build s3://easyact.cn
