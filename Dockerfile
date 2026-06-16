FROM node:22-alpine

RUN apk add  --no-cache git


WORKDIR  /app

RUN git clone https://github.com/AlexCancian/ComputacaoNuvem.git .

RUN npm install

RUN npm run build

EXPOSE 8000
