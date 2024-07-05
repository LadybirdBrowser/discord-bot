This is the source for the Ladybird Discord Bot.

### Setup

The bot is written in [TypeScript](https://www.typescriptlang.org), `bun` is a pre-requisite.

Then setup your environment:

```
$ git clone https://github.com/LadybirdBrowser/discord-bot
$ cd discord-bot
$ bun install
$ bun start
```

### Configuration

To configure the bot for local development you simply need to drop your discord bot token and guild ID in an `.env` file at the root of this project.
The contents should look something like:

```ini
discord_token=<your-token-goes-here>
guild_id=<your-guild-id-goes-here>
```

See: https://www.writebots.com/discord-bot-token/

Now you can run `bun start:dev` and the bot will startup, and then restart as you save changes to the source files:

```
❯ bun start:dev
$ bun --watch ./src/index.ts
Logged in as Ladybird Bot#6714.
```

### Running Tests

There are no tests yet, please help add some.

### Credits

This was originally based off of the following discord bot template: https://github.com/MidasXIV/hive-greeter
