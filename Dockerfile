#Dockerized Fluigi Cloud
FROM nodesource/node:4.0
MAINTAINER Priya Kapadia <priyak@bu.edu>

#Install dependencies
ADD package.json package.json
RUN npm install

#Clone GitHub repo if not cached
RUN git clone https://github.com/CIDARLAB/Fluigi-Cloud

#Add to working directory
ADD . .

#Set startup command
CMD [ "npm", "start" ]
