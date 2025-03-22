FROM nginx:stable-alpine

RUN apk --update add nodejs npm git build-base python3
RUN npx create-react-app myreact --yes --no-git

COPY ./index.html /myreact/public
COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

ENTRYPOINT [ "entrypoint.sh" ]
