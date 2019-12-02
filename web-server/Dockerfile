FROM node:12.13.1    

ADD . /usr/src/m7011e_web_server
WORKDIR /usr/src/m7011e_web_server
COPY package.json .
RUN npm install
COPY . .

EXPOSE 3100

CMD [ "npm", "run", "dev-start" ]