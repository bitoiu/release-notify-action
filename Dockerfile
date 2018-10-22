FROM node:10.11.0-alpine

LABEL "com.github.actions.name"="Release Notifier"
LABEL "com.github.actions.description"="Notifies developers via e-mail of release notes"
LABEL "com.github.actions.icon"="send"
LABEL "com.github.actions.color"="yellow"

LABEL "repository"="http://github.com/bitoiu/release-notify-action"
LABEL "homepage"="http://github.com/bitoiu"
LABEL "maintainer"="vmrmonteiro@gmail.com"

COPY ./src /notify-action
COPY ./entrypoint.sh /notify-action/entrypoint.sh

ENTRYPOINT ["/notify-action/entrypoint.sh"]
