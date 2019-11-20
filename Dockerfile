FROM node:6.12.0    

WORKDIR /usr/src/m5011e_sim
COPY package.json .
RUN npm install    
COPY . .

CMD [ "npm", "start" ]