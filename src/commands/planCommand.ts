/*
 * Copyright (c) 2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "./command";

export class PlanCommand extends Command {
  private readonly baseReply: string = `> Will Ladybird support \`$THING\`?\nMaybe. Maybe not. There is no plan.\n\nSee: [FAQ](<https://github.com/LadybirdBrowser/ladybird/blob/master/Documentation/FAQ.md>)`;

  override data() {
    const aliases = ["plan", "wen"];
    const description = "Check if a feature is part of the plan";

    const baseCommand = new SlashCommandBuilder()
      .setDescription(description)
      .addStringOption(feature =>
        feature.setName("feature").setDescription("The feature to check")
      );

    return aliases.map(name => baseCommand.setName(name).toJSON());
  }

  override async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isCommand()) return;

    let content = this.baseReply;

    const feature = interaction.options.getString("feature");

    if (feature) content = content.replace("`$THING`", feature);

    await interaction.reply({
      content,
    });
  }
}
