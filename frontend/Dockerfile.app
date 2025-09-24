# 開発用ステージ
FROM node:20 AS development

WORKDIR /app
# クリーンインストールを強制（npmバグ回避）
RUN rm -rf node_modules package-lock.json
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 本番用ステージ
FROM node:20 AS production

WORKDIR /app
# クリーンインストールを強制（npmバグ回避）
RUN rm -rf node_modules package-lock.json
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]