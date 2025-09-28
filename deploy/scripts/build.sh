#!/bin/bash
# deploy/scripts/build.sh

set -e

echo "開始建置龜馬山志工排班系統..."

# 建立必要的目錄
mkdir -p logs
mkdir -p database
mkdir -p ssl

# 檢查Node.js版本
NODE_VERSION=$(node -v)
echo "Node.js版本: $NODE_VERSION"

# 檢查Docker是否安裝
if ! command -v docker &> /dev/null; then
    echo "錯誤: Docker未安裝"
    exit 1
fi

echo "Docker版本: $(docker --version)"

# 檢查Docker Compose是否安裝
if ! command -v docker-compose &> /dev/null; then
    echo "錯誤: Docker Compose未安裝"
    exit 1
fi

echo "Docker Compose版本: $(docker-compose --version)"

# 安裝前端依賴並建置
echo "安裝前端依賴..."
cd frontend
npm ci

echo "建置前端..."
npm run build

# 回到根目錄
cd ..

# 檢查後端依賴
echo "檢查後端依賴..."
cd backend
if [ ! -f "package-lock.json" ]; then
    npm install
fi

# 回到根目錄
cd ..

# 建置Docker鏡像
echo "建置Docker鏡像..."
docker-compose -f deploy/docker/docker-compose.yml build

echo "建置完成！"
echo "您可以使用以下命令啟動應用："
echo "  docker-compose -f deploy/docker/docker-compose.yml up -d"
