ARG BUN_VERSION="1.1.38"

# --- Build container ---
FROM oven/bun:${BUN_VERSION}-slim AS build

ARG REVISION="master"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y build-essential git python3

RUN mkdir /app \
    && cd /app \
    && git clone https://github.com/LadybirdBrowser/discord-bot.git \
    && cd discord-bot \
    && git checkout "${REVISION}" \
    && rm -rf .git \
    && bun install

# --- Runtime image ---
FROM oven/bun:${BUN_VERSION}-slim

LABEL maintainer="Ladybird Browser Initiative <contact@ladybird.org>"

RUN mkdir /app
COPY --from=build /app/discord-bot /app/discord-bot

RUN useradd discord-bot \
    && chown -R discord-bot:discord-bot /app/discord-bot

USER discord-bot
WORKDIR /app/discord-bot

ENTRYPOINT [ "/usr/local/bin/bun" ]
CMD [ "start" ]
