import type { ChatUserstate } from "tmi.js";
import { EMOTES, JABRONIS, QUOTES, STEINERMATH } from "./constants";

// Utility function
function generateRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Command handlers
export const commands = {
  emote: (channel: string) => {
    return generateRandomItem(EMOTES.all);
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
};

// Types for our command handlers
export type CommandHandler = (
  channel: string,
  userstate: ChatUserstate,
  message: string,
  self: boolean
) => string | Promise<string>;
