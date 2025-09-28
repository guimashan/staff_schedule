#!/bin/bash
# deploy/scripts/health-check.sh

set -e

echo "運行健康檢查..."

# 檢查Nginx狀態
echo "檢查Nginx..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✓ Nginx 運行正常"
else
    echo "✗ Nginx 檢查失敗"
    exit 1
fi

# 檢查API狀態
echo "檢查API..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✓ API 運行正常"
else
    echo "✗ API 檢查失敗"
    exit 1
fi

# 檢查Redis狀態
echo "檢查Redis..."
if docker-compose -f deploy/docker/docker-compose.prod.yml exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis 運行正常"
else
    echo "✗ Redis 檢查失敗"
    exit 1
fi

# 檢查資料庫連接
echo "檢查資料庫..."
if docker-compose -f deploy/docker/docker-compose.prod.yml exec app sqlite3 /app/backend/database.db "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ 資料庫連接正常"
else
    echo "✗ 資料庫檢查失敗"
    exit 1
fi

# 檢查快取系統
echo "檢查快取系統..."
if curl -f http://localhost/api/performance/monitor > /dev/null 2>&1; then
    echo "✓ 快取系統正常"
else
    echo "✗ 快取系統檢查失敗"
fi

echo "所有健康檢查通過！"
echo "系統運行正常"
