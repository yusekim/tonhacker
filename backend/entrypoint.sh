#!/bin/sh


mkdir -p directions-server
cd directions-server
cat <<EOF > .env
CLIENT_KEY=$CLIENT_KEY
CLIENT_SECRET=$CLIENT_SECRET
EOF
npm init -y
npm install express cors node-fetch dotenv
cp /srcs/server.js .
node server.js
