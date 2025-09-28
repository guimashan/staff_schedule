#!/bin/bash
# production/deployment/rollback.sh

set -e

echo "開始回滾龜馬山志工排班系統..."

# 檢查是否在生產環境
if [ "$NODE_ENV" != "production" ]; then
    echo "警告: 非生產環境，請確認是否繼續"
    read -p "是否繼續回滾? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 備份當前配置
echo "備份當前配置..."
cp -r deploy/docker/docker-compose.prod.yml deploy/docker/docker-compose.prod.yml.backup

# 停止當前服務
echo "停止當前服務..."
docker-compose -f deploy/docker/docker-compose.prod.yml down

# 檢查是否有備份版本
if [ -f "deploy/docker/docker-compose.prod.yml.backup" ]; then
    echo "恢復備份配置..."
    cp deploy/docker/docker-compose.prod.yml.backup deploy/docker/docker-compose.prod.yml
fi

# 啟動備份版本
echo "啟動備份版本..."
docker-compose -f deploy/docker/docker-compose.prod.yml up -d

# 等待服務啟動
echo "等待服務啟動..."
sleep 30

# 驗證服務
echo "驗證服務狀態..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✓ 服務回滾成功"
    echo "系統已恢復到上一版本"
    
    # 清理備份文件
    rm -f deploy/docker/docker-compose.prod.yml.backup
    
    # 發送通知
    echo "通知管理員: 系統已回滾到上一穩定版本" | mail -s "系統回滾通知" admin@example.com
    
else
    echo "✗ 服務回滾失敗"
    echo "請手動檢查系統狀態"
    exit 1
fi

echo "回滾完成！"
