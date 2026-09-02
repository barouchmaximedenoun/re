FROM postgres:18-alpine

RUN apk add --no-cache bash gettext

WORKDIR /opt/db

COPY libs/infra/environment/db/postgres/setup /opt/db/infra/setup
COPY libs/platform/identity/environment/db/postgres/auth/setup /opt/db/auth/setup

RUN chmod +x \
    /opt/db/infra/setup/scripts/*.sh \
    /opt/db/auth/setup/scripts/*.sh

CMD ["/opt/db/auth/setup/scripts/setup_auth.docker.sh"]
