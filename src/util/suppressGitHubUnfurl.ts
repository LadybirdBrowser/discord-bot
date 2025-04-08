import { Message, MessageFlags, PermissionFlagsBits } from "discord.js";

export async function suppressGitHubUnfurl(message: Message<true>) {
  if (message.flags.has(MessageFlags.SuppressEmbeds)) return;
  const me = await message.guild.members.fetch(message.client.user.id);

  if (!message.channel.permissionsFor(me).has(PermissionFlagsBits.ManageMessages)) {
    console.log("Missing permissions to suppress embeds.");
    return;
  }

  for (const embed of message.embeds) {
    if (!embed.url) continue;
    const url = new URL(embed.url);
    if (url.host !== "github.com") continue;
    const segments = url.pathname.split("/");
    const githubUrlType: string | undefined = segments[3];

    if (githubUrlType === "tree" || githubUrlType === "blob") {
      await message.edit({ flags: message.flags.bitfield | MessageFlags.SuppressEmbeds });
      return;
    }
  }
}
