#Dockerized Fluigi Cloud
FROM nodesource/node:4.0
MAINTAINER Priya Kapadia <priyak@bu.edu>

#Install dependencies
ADD package.json package.json
RUN npm install

#Add to working directory
ADD . .

#Set startup command
CMD [ "npm", "start" ]
