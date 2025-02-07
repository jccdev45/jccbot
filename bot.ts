import tmi from "tmi.js";

import { getValidAccessToken } from "./auth";
import { commands } from "./commands";
import { TWITCH_BOT_USERNAME, TWITCH_CHANNEL } from "./config";

import type { CommandHandler } from "./commands";

export async function startBot() {
  try {
    const token = await getValidAccessToken();

    const client = new tmi.Client({
      options: { debug: true },
      identity: {
        username: TWITCH_BOT_USERNAME,
        password: `oauth:${token}`,
      },
      channels: [TWITCH_CHANNEL],
    });

    await client.connect();

    client.on("message", async (channel, userstate, message, self) => {
      if (self) return;

      const commandName = message.split(" ")[0].toLowerCase();
      if (commandName.startsWith("$")) {
        const command = commandName.slice(1) as keyof typeof commands;
        if (command in commands) {
          const handler = commands[command] as CommandHandler;
          const response = await handler(channel, userstate, message, self);
          client.say(channel, response);
        } else {
          client.say(
            channel,
            `@${userstate.username} Unrecognized command CONSIDERING`
          );
        }
      }
    });

    // Set up a periodic token refresh
    setInterval(async () => {
      try {
        const newToken = await getValidAccessToken();
        client.getOptions().identity!.password = `oauth:${newToken}`;
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    }, 3600000); // Refresh every hour
  } catch (error) {
    console.error("Failed to start bot:", error);
  }
}
