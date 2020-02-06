FROM node:13.2.0

ARG develop=true
ADD . /usr/src/web
WORKDIR /usr/src/web
COPY package.json .
RUN npm install
COPY . .

CMD [ "npm", "run", "dev-start" ]