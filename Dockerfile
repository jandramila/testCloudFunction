FROM node:14.7

# Set our workdir
WORKDIR /app

# Install and cache app dependencies
COPY package*.json .
RUN npm install

# Add project files
COPY . .

# start app
CMD [ "npm", "start" ]