/*
 * Copyright (c) 2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2024, versecafe
 * Copyright (c) 2022, Filiph Sandström <filiph.sandstrom@filfatstudios.com>
 * Copyright (c) 2023, networkException <networkexception@serenityos.org>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  type Interaction,
  Partials,
} from "discord.js";
import CommandHandler from "@/commandHandler";
import { env } from "@/config/env";

process.on("unhandledRejection", reason => {
  console.log("Unhandled Rejection:", reason);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  presence: {
    activities: [
      {
        type: ActivityType.Custom,
        name: "Type /help to list commands!",
      },
    ],
  },
});

const commandHandler = new CommandHandler();

client.once(Events.ClientReady, () => {
  if (client.user != null) {
    console.log(`Logged in as ${client.user.tag}.`);
    commandHandler.registerInteractions(client);
  }
});
client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (interaction.user.bot) return;

  if (interaction.isCommand() || interaction.isContextMenuCommand())
    commandHandler.handleCommandInteraction(interaction);

  if (interaction.isButton()) commandHandler.handleButtonInteraction(interaction);

  if (interaction.isStringSelectMenu()) commandHandler.handleSelectInteraction(interaction);
});
client.on(Events.Error, e => {
  console.error("Discord client error!", e);
});
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  message = await message.fetch();

  for (const embed of message.embeds) {
    if (!embed.url) continue;

    const url = new URL(embed.url);
    if (url.host !== "github.com") continue;

    const segments = url.pathname.split("/");
    const githubUrlType: string | undefined = segments[3];
    if (githubUrlType === "tree" || githubUrlType === "blob") {
      await message.suppressEmbeds();
      return;
    }
  }
});

client.login(env.DISCORD_TOKEN);
