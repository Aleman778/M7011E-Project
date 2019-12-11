FROM node:13.2.0

ADD . /usr/src/m7011e_sim
WORKDIR /usr/src/m7011e_sim
COPY package.json .
RUN npm install    
COPY . .

EXPOSE 3000
EXPOSE 8000

CMD [ "npm", "start" ]