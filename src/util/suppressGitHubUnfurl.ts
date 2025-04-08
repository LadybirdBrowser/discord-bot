import { Message, MessageFlags } from "discord.js";

export async function suppressGitHubUnfurl(message: Message) {
  if (message.flags.has(MessageFlags.SuppressEmbeds)) return;

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
