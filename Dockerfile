FROM ubuntu:20.04
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && apt install python3 -y && apt install sudo -y
RUN apt install g++ -y && apt install build-essential -y
RUN DEBIAN_FRONTEND=${DEBIAN_FRONTEND} apt install default-jre -y
RUN apt-get install curl -y && curl -sL https://deb.nodesource.com/setup_16.x | bash && apt-get install nodejs -y
RUN npm install --global yarn && npm install --global ts-node

COPY . .
RUN mkdir temp
RUN chmod 700  /
RUN chmod 755 -R temp/
RUN adduser --disabled-password --gecos "" executionuser
RUN yarn

CMD ["yarn","start"]