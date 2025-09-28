#!/bin/bash
# production/deployment/maintenance.sh

set -e

case "$1" in
    "backup")
        echo "開始資料庫備份..."
        docker exec -t guimashan-app sqlite3 /app/backend/database.db ".backup /app/backend/database_backup_$(date +%Y%m%d_%H%M%S).db"
        echo "資料庫備份完成"
        ;;
    
    "cleanup")
        echo "清理系統..."
        # 清理 Docker
        docker system prune -f
        docker volume prune -f
        docker image prune -f
        
        # 清理日誌
        find logs -name "*.log" -mtime +7 -delete
        
        # 清理臨時檔案
        find /tmp -name "guimashan_*" -mtime +1 -delete
        
        echo "系統清理完成"
        ;;
    
    "update")
        echo "更新系統..."
        # 拉取最新代碼
        git pull origin main
        
        # 停止服務
        docker-compose -f deploy/docker/docker-compose.prod.yml down
        
        # 拉取最新鏡像
        docker-compose -f deploy/docker/docker-compose.prod.yml pull
        
        # 重新建置
        docker-compose -f deploy/docker/docker-compose.prod.yml build
        
        # 啟動服務
        docker-compose -f deploy/docker/docker-compose.prod.yml up -d
        
        echo "系統更新完成"
        ;;
    
    "monitor")
        echo "系統監控..."
        docker-compose -f deploy/docker/docker-compose.prod.yml ps
        docker stats --no-stream
        ;;
    
    *)
        echo "用法: $0 {backup|cleanup|update|monitor}"
        echo "  backup   - 備份資料庫"
        echo "  cleanup  - 清理系統"
        echo "  update   - 更新系統"
        echo "  monitor  - 監控系統"
        exit 1
        ;;
esac
