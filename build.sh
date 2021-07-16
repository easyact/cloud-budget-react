#!/bin/bash
set -e
set -o pipefail

instruction()
{
  echo "usage: ./build.sh deploy <env>"
  echo ""
  echo "env: eg. int, staging, prod, ..."
  echo ""
  echo "for example: ./build.sh deploy int"
}

if [ $# -eq 0 ]; then
  instruction
  exit 1
elif [ "$1" = "test" ] && [ $# -eq 1 ]; then
  npm install

  npm run test
elif [ "$1" = "acceptance-test" ] && [ $# -eq 1 ]; then
  npm install

  npm run test
elif [ "$1" = "deploy" ] && [ $# -eq 2 ]; then
  STAGE=$2

  npm install
  ./deploy.sh
else
  instruction
  exit 1
fi
