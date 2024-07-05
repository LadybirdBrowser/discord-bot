/*
 * Copyright (c) 2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { ChatInputCommandInteraction } from "discord.js";
import Command from "./command";

export class QuickLinksCommand extends Command {
  private readonly documentation: string =
    "https://github.com/LadybirdBrowser/ladybird/tree/master/Documentation";

  readonly links: { help: string; response: string; name: string }[] = [
    {
      name: "botsrc",
      response:
        "Bot Source: <https://github.com/LadybirdBrowser/discord-bot/tree/master/src/commands>",
      help: "Get a link to the source code for bot commands",
    },
    {
      name: "build",
      response: `How To Build: <${this.documentation}/BuildInstructionsLadybird.md>`,
      help: "Get a link to the build docs",
    },
    {
      name: "clion",
      response: `Configuring the CLion IDE: <${this.documentation}/CLionConfiguration.md>`,
      help: "Get a link to the directions for configuring the CLion IDE",
    },
    {
      name: "emacs",
      response: `Configuring Emacs: <${this.documentation}/EmacsConfiguration.md>`,
      help: "Get a link to the directions for configuring Emacs",
    },
    {
      name: "vscode",
      response: `Configuring the Visual Studio Code IDE: <${this.documentation}/VSCodeConfiguration.md>`,
      help: "Get a link to the directions for configuring the Visual Studio Code IDE",
    },
    {
      name: "helix",
      response: `Configuring Helix: <${this.documentation}/HelixConfiguration.md>`,
      help: "Get a link to the directions for configuring Helix",
    },
    {
      name: "nvim",
      response: `Configuring Neo Vim: <${this.documentation}/NvimConfiguration.md>`,
      help: "Get a link to the directions for configuring Neo Vim",
    },
    {
      name: "vim",
      response: `Configuring Vim: <${this.documentation}/NvimConfiguration.md>`,
      help: "Get a link to the directions for configuring Vim",
    },
    {
      name: "faq",
      response: `FAQ: <${this.documentation}/FAQ.md>`,
      help: "Get a link to the Ladybird Browser FAQ",
    },
    {
      name: "git-rewrite",
      response: "https://youtu.be/ElRzTuYln0M",
      help: "Get a link to a video explaining how to rewrite git history",
    },
    {
      name: "soytineres",
      response:
        "https://cdn.discordapp.com/attachments/830525235803586570/843838343905411142/IMG_20210517_170429.png",
      help: "!SOytinereS",
    },
    {
      name: "whf",
      response:
        "WHF is short for 'Well hello friends', the greeting used by Andreas in his coding videos",
      help: "Explains the meaning of 'whf'",
    },
  ];

  override data() {
    return this.links.map(link => ({
      name: link.name,
      description: link.help,
    }));
  }

  override async handleCommand(interaction: ChatInputCommandInteraction) {
    for (const link of this.links)
      if (link.name === interaction.commandName) {
        interaction.reply({ content: link.response });
        return;
      }

    throw new Error(`QuickLinksCommand: Invalid command "${interaction.commandName}"`);
  }
}
