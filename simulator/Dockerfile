FROM node:13.2.0

ADD . /usr/src/simulator
WORKDIR /usr/src/simulator
COPY package.json .
RUN npm install    
COPY . .

EXPOSE 3000
EXPOSE 8000

CMD [ "npm", "run", "start:dev:docker" ]