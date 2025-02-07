import schedule from "node-schedule";
import tmi from "tmi.js";

import { getValidAccessToken } from "./auth";
import { commands } from "./commands";
import { TWITCH_BOT_USERNAME, TWITCH_CHANNEL } from "./config";
import { MAX_INTERVAL, MIN_INTERVAL, TIMED_COMMANDS } from "./constants";
import { fetchAndUpdateEmotes } from "./emote-fetcher";

import type { CommandHandler } from "./commands";
function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function executeRandomCommand(client: tmi.Client, channel: string) {
  const totalWeight = TIMED_COMMANDS.reduce((sum, cmd) => sum + cmd.weight, 0);
  let random = Math.random() * totalWeight;

  for (const cmd of TIMED_COMMANDS) {
    if (random < cmd.weight) {
      if (cmd.command in commands) {
        const handler = commands[cmd.command] as CommandHandler;
        const response = await handler(
          channel,
          {} as tmi.ChatUserstate,
          "",
          false
        );
        client.say(channel, response);
      }
      return;
    }
    random -= cmd.weight;
  }
}

function scheduleNextCommand(client: tmi.Client, channel: string) {
  const interval = getRandomInterval(MIN_INTERVAL, MAX_INTERVAL);
  setTimeout(() => {
    executeRandomCommand(client, channel);
    scheduleNextCommand(client, channel);
  }, interval);
}

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

    // Schedule daily emote update
    schedule.scheduleJob("0 0 * * *", async () => {
      try {
        await fetchAndUpdateEmotes();
        console.log("Daily emote update completed");
      } catch (error) {
        console.error("Error during daily emote update:", error);
      }
    });

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

    // Start the random command scheduler
    scheduleNextCommand(client, `#${TWITCH_CHANNEL}`);

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
