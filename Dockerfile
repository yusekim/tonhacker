FROM alpine:latest

RUN apk --update add nodejs npm git build-base python3
RUN npx create-react-app myreact --yes --no-git

COPY ./entrypoint.sh /usr/bin/entrypoint.sh
RUN chmod +x /usr/bin/entrypoint.sh

WORKDIR /myreact

ENTRYPOINT [ "entrypoint.sh" ]
