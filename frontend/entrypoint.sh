#!/bin/sh

cat <<EOF > ./public/config.js
window.__CONFIG__ = {
	naverClientKEY: "$CLIENT_KEY"
};
EOF

npm start
