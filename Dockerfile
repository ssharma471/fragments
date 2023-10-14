# This is a Dockerfile for a Node.js microservice.
# It defines the instructions for building a Docker image
# of the service.

# Use the official Node.js base image with a specific version
FROM node:18.13.0

# Metadata about the image
LABEL maintainer="Sidhant Sharma <ssharma471@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Define environment variables
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Create a working directory for the application
WORKDIR /app

# Copy package.json and package-lock.json to the image
COPY package*.json /app/

# Install Node.js dependencies based on package-lock.json
RUN npm install

# Copy the source code from the host into the image
COPY ./src /app/src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Define the command to start the container
CMD npm start

# Expose the port that the service listens on
EXPOSE 8080
