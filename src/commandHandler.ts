/*
 * Copyright (c) 2021, the SerenityOS & Ladybird developers.
 * Copyright (c) 2022, Filiph Sandström <filiph.sandstrom@filfatstudios.com>
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import * as Commands from "./commands";

import {
  ApplicationCommandType,
  ButtonInteraction,
  Client,
  CommandInteraction,
  type Interaction,
  SelectMenuInteraction, // TODO: fix deprecated
} from "discord.js";

import Command from "./commands/command";
import { env } from "@/config/env";
import config from "./config/botConfig";

export default class CommandHandler {
  private readonly commands: Map<string[], Command>;
  private readonly help: string;

  constructor() {
    const availableCommands = new Array<string>();

    this.commands = new Map(
      Object.values(Commands).map(commandClass => {
        const command = new commandClass();
        const data = command.data();

        for (const entry of data) {
          // @ts-expect-error -- TODO: types need fixes
          if (!entry.type || entry.type === ApplicationCommandType.ChatInput)
            availableCommands.push(`**${entry.name}** - ${entry.description}`);
        }

        return [data.map(entry => entry.name), command];
      })
    );

    this.help = "Available commands:\n" + availableCommands.join("\n");
  }

  async registerInteractions(client: Client): Promise<void> {
    const commands = [
      ...Array.from(this.commands.values())
        .map(command => command.data())
        .flat(),
      {
        name: "help",
        description: "List all available commands",
      },
    ];

    if (!config.production) {
      const guild = await client.guilds.fetch(env.GUILD_ID);

      guild.commands.set(commands);
    }

    if (!client.application) return;

    await client.application.commands.set(commands);
  }

  /** Executes user commands contained in a message if appropriate. */
  async handleCommandInteraction(interaction: Interaction): Promise<void> {
    const msg = `Buggie bot received ${JSON.stringify(
      interaction,
      (_, v) => (typeof v === "bigint" ? `${v.toString()}n` : v),
      4
    )} from '${interaction.user.tag}`;
    console.log(msg);

    if (!interaction.isCommand()) throw new Error("Invalid command interaction");

    if (interaction.commandName === "help") {
      await interaction.reply({
        ephemeral: true,
        content: this.help,
      });
      return;
    }

    let matchedCommand;
    for (const [names, command] of this.commands.entries()) {
      for (const name of names) {
        if (name.toLowerCase() === interaction.commandName) {
          matchedCommand = command;
          break;
        }
      }
    }

    if (!matchedCommand) {
      await interaction.reply({
        ephemeral: true,
        content: "I don't recognize that command.",
      });
      return;
    }

    if (
      interaction.isContextMenuCommand() ||
      interaction.isUserContextMenuCommand() ||
      interaction.isMessageContextMenuCommand()
    ) {
      if (matchedCommand.handleContextMenu)
        return this.callInteractionHandler(
          matchedCommand,
          matchedCommand.handleContextMenu,
          interaction
        );

      throw new Error(`${matchedCommand.constructor.name}: Missing handleContextMenu handler`);
    }

    // NOTE: At this point we can we be sure that it's a command
    return this.callInteractionHandler(matchedCommand, matchedCommand.handleCommand, interaction);
  }

  async handleSelectInteraction(interaction: SelectMenuInteraction): Promise<void> {
    let matchedCommand;

    for (const [names, command] of this.commands.entries()) {
      for (const name of names) {
        const cachedInteraction = interaction as SelectMenuInteraction<"cached">;
        if (name.toLowerCase() === cachedInteraction.message.interaction?.commandName) {
          matchedCommand = command;
          break;
        }
      }
    }

    if (!matchedCommand) {
      await interaction.reply({
        ephemeral: true,
        content: "I don't recognize that command.",
      });
      return;
    }

    if (matchedCommand.handleSelectMenu)
      return this.callInteractionHandler(
        matchedCommand,
        matchedCommand.handleSelectMenu,
        interaction
      );

    throw new Error(`${matchedCommand.constructor.name}: Missing handleSelectMenu handler`);
  }

  async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    for (const [, command] of this.commands.entries()) {
      if (!command.buttonData) continue;

      for (const button of command.buttonData()) {
        if (button === interaction.customId) {
          if (!command.handleButton)
            throw new Error(
              `${command.constructor.name}: handleButton has to be implemented if buttonData lists customId`
            );

          return this.callInteractionHandler(command, command.handleButton, interaction);
        }
      }
    }

    throw new Error(
      `handleButtonInteraction: No registered command matches "${interaction.customId}"`
    );
  }

  private async callInteractionHandler<T>(
    command: Command,
    handler: (interaction: T) => Promise<void>,
    interaction: T & { reply: CommandInteraction["reply"] }
  ): Promise<void> {
    return await handler.call(command, interaction).catch(error => {
      console.trace("matchedCommand.handle{Select|Context}Menu failed", error);

      const content = `⚠️ Something went extremely wrong!\n \`\`\`\n${
        // eslint-disable-next-line -- TODO type properly
        (error as any)?.stack ?? error ?? ""
      }\n\`\`\``;
      // eslint-disable-next-line -- TODO type properly
      if ((interaction as any).deferred || (interaction as any).replied)
        // eslint-disable-next-line -- TODO type properly
        return (interaction as any).editReply({ content });

      interaction.reply({ ephemeral: true, content });
    });
  }
}
