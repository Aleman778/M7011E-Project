FROM node:12.13.1    

ADD . /usr/src/web
WORKDIR /usr/src/web
COPY package.json .
RUN npm install
COPY . .

EXPOSE 3100

CMD [ "npm", "run", "dev-start" ]