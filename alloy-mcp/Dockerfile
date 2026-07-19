FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY src ./src
ENV PORT=8787
EXPOSE 8787
# Set at runtime: ALLOY_ANON_KEY (box anon JWT), ALLOY_MCP_TOKEN (bearer), ALLOY_SUPABASE_URL.
CMD ["node", "src/http.mjs"]
