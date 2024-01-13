FROM node:18-alpine

WORKDIR /app
COPY package*.json .

COPY tsconfig.json .

COPY src /app/src

RUN npm ci

#the post install script that has been added to the package.json runs after the dependencies installed
#so no need to run typescript compile

CMD ["npm", "run", "start"]