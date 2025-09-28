# deploy/docker/Dockerfile
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製package.json和package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製後端程式碼
COPY backend/ ./backend/

# 複製前端程式碼
COPY frontend/ ./frontend/

# 建立前端建置
WORKDIR /app/frontend
RUN npm ci
RUN npm run build

# 回到根目錄
WORKDIR /app

# 建立資料庫目錄
RUN mkdir -p /app/backend/database

# 設定環境變數
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3001

# 啟動命令
CMD ["node", "backend/app.js"]
