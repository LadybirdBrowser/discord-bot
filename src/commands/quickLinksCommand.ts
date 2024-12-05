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
  private readonly editors: string = `${this.documentation}/EditorConfiguration`;

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
      response: `Configuring the CLion IDE: <${this.editors}/CLionConfiguration.md>`,
      help: "Get a link to the directions for configuring the CLion IDE",
    },
    {
      name: "emacs",
      response: `Configuring Emacs: <${this.editors}/EmacsConfiguration.md>`,
      help: "Get a link to the directions for configuring Emacs",
    },
    {
      name: "gettingstarted",
      response: `**Welcome to the Ladybird web browser project!**\nHere's a guide to help you get started contributing: <${this.documentation}/GettingStartedContributing.md>`,
      help: "Get a link to the getting started contributing guide",
    },
    {
      name: "vscode",
      response: `Configuring the Visual Studio Code IDE: <${this.editors}/VSCodeConfiguration.md>`,
      help: "Get a link to the directions for configuring the Visual Studio Code IDE",
    },
    {
      name: "helix",
      response: `Configuring Helix: <${this.editors}/HelixConfiguration.md>`,
      help: "Get a link to the directions for configuring Helix",
    },
    {
      name: "nvim",
      response: `Configuring Neo Vim: <${this.editors}/NvimConfiguration.md>`,
      help: "Get a link to the directions for configuring Neo Vim",
    },
    {
      name: "vim",
      response: `Configuring Vim: <${this.editors}/NvimConfiguration.md>`,
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
      name: "whf",
      response:
        "WHF is short for 'Well hello friends', the greeting used by Andreas in his coding videos",
      help: "Explains the meaning of 'whf'",
    },
    {
      name: "wpt",
      response: `Charts comparing our score to other browsers, over time: <https://linegoup.lol>
Our latest WPT results: <https://wpt.fyi/results/?product=ladybird>`,
      help: "Get links our Web Platform Test results",
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
