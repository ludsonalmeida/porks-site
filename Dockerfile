FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Envs de build do Vite (Railway injeta as variáveis do serviço como build-args).
# Sem ARG, o `docker build` não enxerga as variáveis e o bundle sai sem elas.
ARG VITE_ENGINE_PORKS_URL
ARG VITE_ENGINE_PORKS_CSAT_TOKEN
ENV VITE_ENGINE_PORKS_URL=$VITE_ENGINE_PORKS_URL
ENV VITE_ENGINE_PORKS_CSAT_TOKEN=$VITE_ENGINE_PORKS_CSAT_TOKEN
RUN npm run build
EXPOSE 3000
CMD ["node", "server.js"]
