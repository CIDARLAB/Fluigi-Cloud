#!/bin/bash

#Remove all existing containers
docker rm $(docker ps -a -q)

#Remove all existing images
docker rmi $(docker images -a -q)

#Build the Fluigi Cloud image
echo "[STATUS]		Building the priyak/fluigicloud image..."
docker build -t priyak/fluigicloud .
echo "[STATUS]		Build of priyak/fluigicloud complete"

#Run container on 808 server
docker run -d -p 808:8080 --name FluigiCloud priyak/fluigicloud

#Display port for user
echo "[STATUS]		Fluigi Cloud is now running on the localhost port 808"