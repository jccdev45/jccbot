import type { ChatUserstate } from "tmi.js";
import { JABRONIS, QUOTES, STEINERMATH } from "./constants";
import { fetchAndUpdateEmotes, getRandomEmote } from "./emote-fetcher";

// Utility function
function generateRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Command handlers
export const commands = {
  emote: async (channel: string, userstate: ChatUserstate) => {
    try {
      const randomEmote = await getRandomEmote();
      return randomEmote;
    } catch (error) {
      console.error("Error getting random emote:", error);
      return "Error fetching emote. Please try again later.";
    }
  },

  quote: (channel: string) => {
    return generateRandomItem(QUOTES);
  },

  commands: (channel: string) => {
    return "See https://github.com/jccdev45/jccbot/blob/main/commands-list.md  for a list of commands";
  },

  steinermath: (channel: string) => {
    return STEINERMATH;
  },

  goodnight: (channel: string) => {
    return JABRONIS;
  },

  trivia: async (channel: string, userstate: ChatUserstate) => {
    try {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=1&type=multiple"
      );
      const data = await response.json();
      const question = data.results[0];

      const answers = [
        question.correct_answer,
        ...question.incorrect_answers,
      ].sort(() => Math.random() - 0.5);

      return (
        `Trivia Question: ${question.question}\n` +
        answers.map((answer, index) => `${index + 1}. ${answer}`).join("\n") +
        `\nUse $a followed by your answer number`
      );
    } catch (error) {
      console.error("Error fetching trivia question:", error);
      return `@${userstate.username} Sorry, couldn't fetch a trivia question stonecoldStunner`;
    }
  },

  updateemotes: async (channel: string, userstate: ChatUserstate) => {
    if (userstate.mod || userstate.username === channel.replace("#", "")) {
      try {
        const emotes = await fetchAndUpdateEmotes();
        return `Emotes updated. Total emotes: ${emotes.length}`;
      } catch (error) {
        console.error("Error updating emotes:", error);
        return `Error updating emotes. Please check the logs.`;
      }
    } else {
      return "This command is for moderators only.";
    }
  },
};

export type CommandName = keyof typeof commands;

// Types for our command handlers
export type CommandHandler = (
  channel: string,
  userstate: ChatUserstate,
  message: string,
  self: boolean
) => string | Promise<string>;
