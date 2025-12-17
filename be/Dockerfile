FROM node:20-alpine

WORKDIR /app

# 1. Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install

# 2. Copy toàn bộ mã nguồn
COPY . .

# 3. Khởi tạo Prisma Client (Quan trọng để kết nối Database)
RUN npx prisma generate


# 4. Mở port 8888
EXPOSE 8888

# 5. Chạy dự án bằng lệnh dev (nodemon)
CMD ["npm", "run", "dev"]