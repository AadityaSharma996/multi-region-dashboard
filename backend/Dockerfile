FROM node:24.18.0-alpine
RUN npm install --global npm@11.18.0 && npm cache clean --force

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

ENV NODE_ENV=production
ENV PORT=4000

USER node

EXPOSE 4000

CMD ["npm", "start"]
