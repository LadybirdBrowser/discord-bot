/*
 * Copyright (c) 2024, the SerenityOS & Ladybird developers.
 * Copyright (c) 2024, versecafe
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  type RESTPostAPIApplicationCommandsJSONBody,
  SelectMenuInteraction, // TODO: Get rid of this
} from "discord.js";

export default abstract class Command {
  /** Execute the command. */
  abstract handleCommand(interaction: ChatInputCommandInteraction): Promise<void>;

  handleContextMenu?(interaction: ContextMenuCommandInteraction): Promise<void>;

  handleSelectMenu?(interaction: SelectMenuInteraction): Promise<void>;

  handleButton?(interaction: ButtonInteraction): Promise<void>;

  abstract data(): RESTPostAPIApplicationCommandsJSONBody[];

  buttonData?(): Array<string>;
}
