#!/bin/bash
# production/deploy-final.sh

set -e

echo "==========================================="
echo "龜馬山志工排班系統 - 最終部署"
echo "==========================================="

# 檢查環境
echo "檢查部署環境..."
if [ -z "$JWT_SECRET" ] || [ -z "$DB_PATH" ]; then
    echo "錯誤: 必要的環境變數未設定"
    echo "請設定 JWT_SECRET 和 DB_PATH"
    exit 1
fi

# 執行最終檢查
echo "執行最終檢查..."
./deploy/scripts/health-check.sh

# 執行安全審計
echo "執行安全審計..."
node -e "
  const securityAudit = require('./production/security/audit');
  securityAudit.generateSecurityReport().then(report => {
    console.log('安全審計完成');
    console.log('整體分數:', report.audit.overallScore);
    if (report.audit.overallScore < 80) {
      console.log('警告: 安全分數低於80分');
    }
  }).catch(console.error);
"

# 執行效能測試
echo "執行效能測試..."
npm run test:performance

# 執行最終部署
echo "開始最終部署..."
docker-compose -f deploy/docker/docker-compose.prod.yml down --remove-orphans
docker-compose -f deploy/docker/docker-compose.prod.yml up -d --build

# 等待服務啟動
echo "等待服務啟動..."
sleep 60

# 驗證部署
echo "驗證部署..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✓ 部署成功"
    
    # 執行最終測試
    echo "執行最終功能測試..."
    ./deploy/scripts/health-check.sh
    
    # 發送部署通知
    echo "系統部署完成 - $(date)" | mail -s "部署完成通知" admin@example.com
    
    echo "==========================================="
    echo "部署完成！"
    echo "系統已上線運行"
    echo "訪問地址: http://localhost"
    echo "==========================================="
else
    echo "✗ 部署失敗"
    echo "請檢查系統狀態"
    exit 1
fi
