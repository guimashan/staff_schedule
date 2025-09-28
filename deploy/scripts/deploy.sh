#!/bin/bash
# deploy/scripts/deploy.sh

set -e

echo "開始部署龜馬山志工排班系統..."

# 檢查環境變數
if [ -z "$JWT_SECRET" ]; then
    echo "錯誤: JWT_SECRET 環境變數未設定"
    exit 1
fi

if [ -z "$DB_PATH" ]; then
    echo "錯誤: DB_PATH 環境變數未設定"
    exit 1
fi

# 檢查SSL證書
if [ ! -f "deploy/nginx/ssl/cert.pem" ] || [ ! -f "deploy/nginx/ssl/key.pem" ]; then
    echo "警告: SSL證書未找到，將使用HTTP模式"
fi

# 停止現有容器
echo "停止現有容器..."
docker-compose -f deploy/docker/docker-compose.prod.yml down --remove-orphans

# 拉取最新鏡像
echo "拉取最新鏡像..."
docker-compose -f deploy/docker/docker-compose.prod.yml pull

# 建置應用
echo "建置應用..."
docker-compose -f deploy/docker/docker-compose.prod.yml build

# 啟動服務
echo "啟動服務..."
docker-compose -f deploy/docker/docker-compose.prod.yml up -d

# 等待服務啟動
echo "等待服務啟動..."
sleep 30

# 檢查服務狀態
echo "檢查服務狀態..."
docker-compose -f deploy/docker/docker-compose.prod.yml ps

# 運行健康檢查
echo "運行健康檢查..."
./deploy/scripts/health-check.sh

echo "部署完成！"
echo "應用程式將在 http://localhost 或 https://localhost 可用"
