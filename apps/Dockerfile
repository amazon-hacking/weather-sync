# Dockerfile simplificado para Weather Sync
FROM oven/bun:1-slim

# Configurar ambiente
ENV NODE_ENV=production
WORKDIR /app

# Copiar e instalar dependências
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copiar código fonte
COPY . .

# Configurar usuário e porta
USER bun
EXPOSE 8080

# Iniciar aplicação
CMD ["bun", "run", "src/app.ts"]