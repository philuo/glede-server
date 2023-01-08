#!/bin/bash

set -e

# 您完全可以自定义部署, 本脚本仅供参考

# 应用需要部署的绝对路径
app_server=/usr/local/workspace/xx

cd "$app_server"

git reset --hard HEAD
git pull --force origin main:main

if [ $1 -eq "0" ]; then
    rm -rf package-lock.json
    rm -rf node_modules
    npm install --registry=https://registry.npmmirror.com
fi

status=$?

if [ $status -eq 0 ]; then
    pm2 delete oker-campus
    npm run server
    echo "==finish to deploy==";
fi
