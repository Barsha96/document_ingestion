FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm", "run", "dev"]
