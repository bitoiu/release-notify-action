FROM node:10.11.0-alpine

COPY ./src /notify-action

ENTRYPOINT ["/notify-action/entrypoint.sh"]

LABEL "com.github.actions.name"="Release Notifier Action"
LABEL "com.github.actions.description"="Notifies developers on release with release notes via e-mail"
LABEL "com.github.actions.icon"="send"
LABEL "com.github.actions.color"="yellow"
LABEL "repository"="http://github.com/bitoiu/release-notify-action"
LABEL "homepage"="http://github.com/bitoiu"
LABEL "maintainer"="vmrmonteiro@gmail.com"
