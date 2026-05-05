FROM node:24-alpine
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 3001
ENV MCP_TRANSPORT=sse

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "const http=require('http'); http.get('http://localhost:3001/health', r => {process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["pnpm", "start"]
