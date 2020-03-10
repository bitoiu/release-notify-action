FROM node:10.11.0-alpine
ENV NODE_ENV=production

LABEL "com.github.actions.name"="Release Notifier Action"
LABEL "com.github.actions.description"="Notifies developers on release with release notes via e-mail"
LABEL "com.github.actions.icon"="send"
LABEL "com.github.actions.color"="yellow"
LABEL "repository"="http://github.com/ba-st/actions-email-release-notifications"
LABEL "homepage"="http://github.com/ba-st"
LABEL "maintainer"="gcotelli@gmail.com"

WORKDIR /opt/notify
COPY package.json package-lock.json ./
COPY src ./src
RUN npm install --production

ENTRYPOINT ["node", "/opt/notify/src/notify.js"]
