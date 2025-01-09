FROM node:20-alpine as base

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

FROM base as development
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3333
CMD ["npm", "run", "dev"]

FROM base as production-builder
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate

FROM base as production
RUN npm install --omit=dev
# Certifique-se de que os arquivos de build estão na pasta correta
COPY --from=production-builder /app/dist /app/dist
COPY --from=production-builder /app/node_modules/.prisma /app/node_modules/.prisma
EXPOSE 3333
CMD ["npm", "start"]
