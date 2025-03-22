#!/bin/sh

cd /myreact
cat <<EOF > ./public/config.js
window.__CONFIG__ = {
	naverClientKEY: "$CLIENT_KEY"
};
EOF

npm run build

nginx
