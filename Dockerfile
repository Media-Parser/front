# ssami-front/src/Dockerfile
# 1. Node.js 이미지 사용
FROM node:20

# 2. 작업 디렉터리 생성
WORKDIR /app

# 3. 의존성 복사 및 설치
COPY package*.json ./
RUN npm install

# 4. 전체 소스 복사
COPY . .

# 5. 개발 서버 실행 (포트 3000, 5173 등 실제 사용하는 포트로)
CMD ["npm", "run", "dev"]
