import { INITIALPOINTS, JABRONIS, QUOTES, STEINERMATH } from "./constants.js";
import { fetchAndUpdateEmotes, getRandomEmote } from "./emote-fetcher.js";
import {
  addUserPoints,
  calculateGambleAmount,
  canClaimInitialPoints,
  getUserPoints,
  initializeUserPoints,
  setClaimedInitialPoints,
  setUserPoints,
  subtractUserPoints,
} from "./points.js";
import { getCurrentSong } from "./spotify.js";
import { getChannelTitle } from "./title.js";
import { fetchTrivia, handleTriviaAnswer } from "./trivia.js";
import { CommandHandler } from "./types.js";

import type { ChatUserstate } from "tmi.js";
interface Commands {
  [key: string]: CommandHandler;
}

// Utility function
function generateRandomItem<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Array cannot be empty");
  }
  return array[Math.floor(Math.random() * array.length)]!;
}

// Command handlers
export const commands: Commands = {
  site: () => {
    return `https://jccdev.vercel.app wideJime`;
  },

  socials: () => {
    return `Twitter: https://twitter.com/jccdev | IG: https://instagram.com/jccdev`;
  },

  song: async (channel: string, userstate: ChatUserstate) => {
    if (userstate.username !== channel.replace("#", ""))
      return "uumActually nice try";

    try {
      const song = await getCurrentSong();
      const emote = generateRandomItem([
        "patrickPls",
        "VibeGandalf",
        "YouLookFlyToday",
        "ZaynDance",
        "cenaJAM",
        "cenaJAMPARTY",
      ]);
      return song + " " + emote;
    } catch (error) {
      console.error("Error fetching song (commands.ts): ", error);
      return "Error fetching song. Please try again later.";
    }
  },

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
      const answer = await handleTriviaAnswer(channel, userstate, message);
      return answer;
    } catch (error) {
      console.error("Error handling trivia answer (commands.ts): ", error);
      return "Error with trivia answer. Please try again later.";
    }
  },

  setpoints: (channel: string, userstate: ChatUserstate, message: string) => {
    const [_, recipient, amountStr] = message.split(" ");
    const amount = amountStr ? parseInt(amountStr, 10) : 0;
    if (!recipient) {
      return "Recipient is not specified.";
    }

    if (userstate.username !== channel.replace("#", ""))
      return "uumActually nice try";

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

    const amount = calculateGambleAmount(input || "", currentPoints);

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

    if (recipient) {
      initializeUserPoints(recipient);
    } else {
      return "Recipient is not specified.";
    }

    const amount = calculateGambleAmount(input || "", senderPoints);

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

  emote: async () => {
    try {
      const randomEmote = await getRandomEmote();
      return randomEmote;
    } catch (error) {
      console.error("Error getting random emote (commands.ts): ", error);
      return "Error fetching emote. Please try again later.";
    }
  },

  quote: () => {
    return generateRandomItem(QUOTES);
  },

  commands: () => {
    return "See https://github.com/jccdev45/jccbot/blob/main/commands-list.md  for a list of commands";
  },

  steinermath: () => {
    return STEINERMATH;
  },

  goodnight: () => {
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
      return "uumActually Nice try";
    }
  },

  feet: () => {
    return `Jime Thinking1 ${generateRandomItem([
      "mistleToe",
      "peepoFeet",
    ])} Thinking2`;
  },

  title: async (channel: string, userstate: ChatUserstate) => {
    console.log("🚀 ~ title: ~ userstate:", userstate);
    const username = userstate.username;

    try {
      const title = await getChannelTitle(username);
      return title;
    } catch (error) {
      console.error("Error getting title (commands.ts): ", error);
      return "Error fetching title. Please try again later.";
    }
  },
};
