import schedule from "node-schedule";
import { Client } from "tmi.js";

import { getValidAccessToken } from "./auth";
import {
  clearTriviaState,
  commands,
  getTriviaState,
  startTriviaCooldown,
} from "./commands";
import { TWITCH_BOT_USERNAME, TWITCH_CHANNEL } from "./config";
import {
  ANSWERTIMELIMIT,
  MAX_INTERVAL,
  MIN_INTERVAL,
  TIMED_COMMANDS,
  WARNINGTIME,
} from "./constants";
import { fetchAndUpdateEmotes } from "./emote-fetcher";

import type { ChatUserstate } from "tmi.js";

import type { CommandHandler } from "./types";

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
        client.say(channel, response);
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

function checkTriviaTimeouts(channel: string, client: Client) {
  let warningSent = false; // Track whether warning has been sent

  const intervalId = setInterval(() => {
    const triviaState = getTriviaState(channel);
    if (!triviaState) {
      clearInterval(intervalId);
      return;
    }

    const elapsed = Date.now() - triviaState.startTime;

    if (elapsed >= ANSWERTIMELIMIT) {
      clearTriviaState(channel);
      startTriviaCooldown(channel);
      client.say(
        channel,
        `Time's up! The correct answer was ${triviaState.correctAnswer}`
      );
      clearInterval(intervalId);
    } else if (elapsed >= ANSWERTIMELIMIT - WARNINGTIME && !warningSent) {
      client.say(channel, "10 seconds left to answer!");
      warningSent = true; // Set warning flag to prevent resending
    }

    // Clear interval if trivia ended by other means
    if (!getTriviaState(channel)) {
      clearInterval(intervalId);
    }
  }, 1000); // Check every second
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
          const response = await handler(channel, userstate, message);

          if (response !== null) {
            client.say(channel, response);
          }

          // Start trivia timeout check if a new trivia game started
          if (command === "trivia" && getTriviaState(channel)) {
            checkTriviaTimeouts(channel, client);
          }
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
