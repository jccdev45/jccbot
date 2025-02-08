import { INITIALPOINTS, JABRONIS, QUOTES, STEINERMATH } from "./constants";
import { fetchAndUpdateEmotes, getRandomEmote } from "./emote-fetcher";
import {
  addUserPoints,
  calculateGambleAmount,
  canClaimInitialPoints,
  getUserPoints,
  initializeUserPoints,
  setClaimedInitialPoints,
  setUserPoints,
  subtractUserPoints,
} from "./points";
import { fetchTrivia, handleTriviaAnswer } from "./trivia";

import type { ChatUserstate } from "tmi.js";

// Utility function
function generateRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Command handlers
export const commands = {
  trivia: async (channel: string, userstate: ChatUserstate) => {
    try {
      const trivia = await fetchTrivia(channel, userstate);
      return trivia;
    } catch (error) {
      console.error("Error fetching trivia (commands.ts): ", error);
      return "Error fetching trivia. Please try again later.";
    }
  },

  a: async (channel: string, userstate: ChatUserstate, message: string) => {
    try {
      const answer = handleTriviaAnswer(channel, userstate, message);
      return answer;
    } catch (error) {
      console.error("Error handling trivia answer (commands.ts): ", error);
      return "Error with trivia answer. Please try again later.";
    }
  },

  setpoints: (channel: string, userstate: ChatUserstate, message: string) => {
    const [_, recipient, amountStr] = message.split(" ");
    const amount = parseInt(amountStr, 10);

    if (userstate.username !== channel) return "uumActually nice try";

    if (isNaN(amount) || amount < 0) {
      return `ARISEN`;
    } else {
      setUserPoints(recipient, amount);
      setClaimedInitialPoints(recipient);
      return `@${recipient} now has ${getUserPoints(
        recipient
      )} points CheersStoneCold`;
    }
  },

  claim: (channel: string, userstate: ChatUserstate) => {
    const username = userstate.username!;
    initializeUserPoints(username);

    if (canClaimInitialPoints(username)) {
      setUserPoints(username, INITIALPOINTS);
      setClaimedInitialPoints(username);
      return `@${username} has claimed their initial ${INITIALPOINTS} points shrock`;
    } else {
      return `@${username} you already claimed your points, dummy YEAH`;
    }
  },

  gamble: (channel: string, userstate: ChatUserstate, message: string) => {
    const username = userstate.username!;
    const [_, input] = message.split(" ");
    const currentPoints = getUserPoints(username);

    if (currentPoints === 0) {
      return `@${username} you're broke! Try $claim if you haven't already claimed your initial points livJAM`;
    }

    const amount = calculateGambleAmount(input, currentPoints);

    if (amount <= 0 || amount > currentPoints) {
      return `wideSHUTUPBITCH @${username}`;
    }

    const win = Math.random() < 0.5;
    if (win) {
      addUserPoints(username, amount);
      if (amount === currentPoints) {
        return `@${username} went all in and got their shit in BIG TIME, winning ${amount} ${
          amount === 1 ? "point" : "points"
        } for their new total of ${getUserPoints(username)} ${
          getUserPoints(username) === 1 ? "point" : "points"
        } YEAH`;
      } else {
        return `@${username} got their shit in, winning ${amount} ${
          amount === 1 ? "point" : "points"
        } for their new total of ${getUserPoints(username)} ${
          getUserPoints(username) === 1 ? "point" : "points"
        } OmegaApproves`;
      }
    } else {
      subtractUserPoints(username, amount);
      if (amount === currentPoints) {
        return `@${username} went all in and got BURIED, losing ${amount} ${
          amount === 1 ? "point" : "points"
        } with a new total of ${getUserPoints(username)} ${
          getUserPoints(username) === 1 ? "point" : "points"
        } BuriedByHHH`;
      } else {
        return `@${username} did the job, losing ${amount} ${
          amount === 1 ? "point" : "points"
        } with a new total of ${getUserPoints(username)} ${
          getUserPoints(username) === 1 ? "point" : "points"
        } scOMG`;
      }
    }
  },

  give: (channel: string, userstate: ChatUserstate, message: string) => {
    const [_, recipient, input] = message.split(" ");
    const sender = userstate.username!;
    const senderPoints = getUserPoints(sender);

    if (senderPoints === 0) {
      return `@${sender} try $claim first livJAM`;
    }

    initializeUserPoints(recipient);

    const amount = calculateGambleAmount(input, senderPoints);

    if (amount <= 0 || amount > senderPoints) {
      return `wideSHUTUPBITCH @${sender}`;
    }

    subtractUserPoints(sender, amount);
    addUserPoints(recipient, amount);

    return `sethPog @${sender} gifted ${amount} ${
      amount === 1 ? "point" : "points"
    } to @${recipient}! What a maneuver!`;
  },

  points: (channel: string, userstate: ChatUserstate) => {
    const username = userstate.username!;
    const points = getUserPoints(username);

    if (points === 0 && canClaimInitialPoints(username)) {
      return `@${username}, try $claim first livJAM`;
    }

    if (points === 0) {
      return `@${username}, you're at rock bottom with zero points OmegaStare`;
    } else if (points < 500) {
      return `@${username}, you've only got ${points} ${
        points === 1 ? "point" : "points"
      }. Bury me softly brother... BuriedByHHH`;
    } else if (points < 1000) {
      return `@${username} is my favorite MID -carder with ${points} points`;
    } else if (points < 5000) {
      return `@${username}, main event material at ${points} points! ZaynDance`;
    } else {
      return `Ladies and gentlemen, with a whopping ${points} points... @${username}! cenaJAM`;
    }
  },

  emote: async (channel: string, userstate: ChatUserstate) => {
    try {
      const randomEmote = await getRandomEmote();
      return randomEmote;
    } catch (error) {
      console.error("Error getting random emote (commands.ts): ", error);
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

  feet: () => {
    return `SpiritEel`;
  },
};
