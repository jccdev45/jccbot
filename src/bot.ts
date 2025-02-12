import schedule from "node-schedule";
import { Client } from "tmi.js";

import { getValidAccessToken } from "./auth.js";
import { commands } from "./commands.js";
import { TWITCH_BOT_USERNAME, TWITCH_CHANNEL } from "./config.js";
import { MAX_INTERVAL, MIN_INTERVAL, TIMED_COMMANDS } from "./constants.js";
import { fetchAndUpdateEmotes } from "./emote-fetcher.js";
import { checkTriviaTimeouts, getTriviaState } from "./trivia.js";

import type { ChatUserstate } from "tmi.js";

import type { CommandHandler } from "./types.js";

function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function executeRandomCommand(client: Client, channel: string) {
  const totalWeight = TIMED_COMMANDS.reduce((sum, cmd) => sum + cmd.weight, 0);
  let random = Math.random() * totalWeight;

  for (const cmd of TIMED_COMMANDS) {
    if (random < cmd.weight) {
      if (cmd.command in commands) {
        const handler = commands[cmd.command] as CommandHandler;
        const response = await handler(channel, {} as ChatUserstate, "", false);
        if (response !== null) {
          client.say(channel, response);
        }
      }
      return;
    }
    random -= cmd.weight;
  }
}

function scheduleNextCommand(client: Client, channel: string) {
  const interval = getRandomInterval(MIN_INTERVAL, MAX_INTERVAL);
  setTimeout(() => {
    executeRandomCommand(client, channel);
    scheduleNextCommand(client, channel);
  }, interval);
}

export async function startBot() {
  try {
    const token = await getValidAccessToken();

    const client = new Client({
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
        console.error("Error during daily emote update: ", error);
      }
    });

    let clearTriviaTimeout: (() => void) | null = null;

    client.on("message", async (channel, userstate, message, self) => {
      if (self) return;

      const commandName = message.split(" ")[0]?.toLowerCase() ?? "";
      if (commandName.startsWith("$")) {
        const command = commandName.slice(1) as keyof typeof commands;
        if (command in commands) {
          const handler = commands[command] as CommandHandler;
          const response = await handler(channel, userstate, message);

          if (response !== null) {
            client.say(channel, response);
          }

          // Handle trivia command
          if (command === "trivia") {
            const triviaState = getTriviaState(channel);
            if (triviaState) {
              // Clear existing timeout if there is one
              if (clearTriviaTimeout) {
                clearTriviaTimeout();
              }
              // Start new timeout
              clearTriviaTimeout = checkTriviaTimeouts(channel, client);
            } else {
              return null;
            }
          }
        } else {
          client.say(
            channel,
            `@${userstate.username} Unrecognized command Jime Shyfingers`
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
