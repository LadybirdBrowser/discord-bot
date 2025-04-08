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
  Message,
  Partials,
} from "discord.js";
import CommandHandler from "@/commandHandler";
import { env } from "@/config/env";
import { suppressGitHubUnfurl } from "./util/suppressGitHubUnfurl";

process.on("unhandledRejection", reason => {
  console.log("Unhandled Rejection:", reason);
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
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

// Message updates contain full data. Typings are corrected in a newer discord.js version.
client.on(Events.MessageUpdate, async (_, newMessage) => {
  if (!newMessage.inGuild()) return;
  await suppressGitHubUnfurl(newMessage as Message<true>);
});

client.on(Events.MessageCreate, async (message: Message<boolean>) => {
  if (message.author.bot || !message.inGuild()) return;
  await suppressGitHubUnfurl(message);
});

client.login(env.DISCORD_TOKEN);
