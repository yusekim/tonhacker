#!/bin/sh

mkdir -p directions-server
cd directions-server
npm init -y
npm install express cors node-fetch
cp /srcs/server.js .
node server.js
