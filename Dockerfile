FROM alpine:latest

RUN apk --update add nodejs npm git build-base python3
RUN npx create-react-app my-react-app --yes --no-git
WORKDIR /my-react-app

CMD [ "npm", "start" ]
