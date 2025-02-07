import { JSDOM } from "jsdom";

import {
  ANSWERTIMELIMIT,
  INITIALPOINTS,
  JABRONIS,
  QUOTES,
  STEINERMATH,
  TRIVIA_COOLDOWN,
  WARNINGTIME,
} from "./constants";
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

import type { ChatUserstate } from "tmi.js";
import type { TriviaState } from "./types";

const activeTrivia: { [channel: string]: TriviaState } = {};
const triviaCooldowns: { [channel: string]: number } = {};

// Utility function
function generateRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function decodeHtmlEntities(text: string): string {
  const dom = new JSDOM(text);
  return dom.window.document.body.textContent || "";
}

export function getTriviaState(channel: string): TriviaState | null {
  return activeTrivia[channel] || null;
}

export function clearTriviaState(channel: string): void {
  delete activeTrivia[channel];
}

export function startTriviaCooldown(channel: string): void {
  triviaCooldowns[channel] = Date.now();
}

export function checkTriviaTimeout(channel: string): string | null {
  const trivia = getTriviaState(channel);
  if (!trivia) return null;

  const elapsed = Date.now() - trivia.startTime;
  if (elapsed >= ANSWERTIMELIMIT) {
    clearTriviaState(channel);
    startTriviaCooldown(channel);
    return `Time's up! The correct answer was ${trivia.correctAnswer}`;
  } else if (elapsed >= ANSWERTIMELIMIT - WARNINGTIME) {
    return "10 seconds left to answer!";
  }

  return null;
}

// Command handlers
export const commands = {
  trivia: async (channel: string, userstate: ChatUserstate) => {
    const now = Date.now();
    const lastUsed = triviaCooldowns[channel] || 0;
    const cooldownRemaining = TRIVIA_COOLDOWN - (now - lastUsed);

    if (cooldownRemaining > 0) {
      const secondsRemaining = Math.ceil(cooldownRemaining / 1000);
      return `Trivia is on cooldown. Please wait ${secondsRemaining} second${
        secondsRemaining !== 1 ? "s" : ""
      } before using this command again.`;
    }

    if (activeTrivia[channel]) {
      return "There's already an active trivia game in this channel!";
    }

    try {
      const response = await fetch(
        "https://opentdb.com/api.php?amount=1&type=multiple"
      );
      const data = await response.json();
      const questionData = data.results[0];

      const question = decodeHtmlEntities(questionData.question);
      const correctAnswer = decodeHtmlEntities(questionData.correct_answer);
      const incorrectAnswers = questionData.incorrect_answers.map(
        (answer: string) => decodeHtmlEntities(answer)
      );

      const answers = [correctAnswer, ...incorrectAnswers].sort(
        () => Math.random() - 0.5
      );

      activeTrivia[channel] = {
        question,
        correctAnswer,
        answers,
        startTime: Date.now(),
      };

      return (
        `Trivia Question: ${question}\n` +
        answers.map((answer, index) => `${index + 1}. ${answer}`).join("\n") +
        "\nUse $a followed by your answer number!"
      );
    } catch (error) {
      console.error("Error fetching trivia question:", error);
      return `@${userstate.username} Sorry, couldn't fetch a trivia question stonecoldStunner`;
    }
  },

  a: async (channel: string, userstate: ChatUserstate, message: string) => {
    const trivia = getTriviaState(channel);
    if (!trivia) {
      return null; // Silent fail if no active trivia
    }

    const userAnswer = message.split(" ")[1];
    if (!userAnswer) {
      return null; // Silent fail for invalid input
    }

    const answerIndex = parseInt(userAnswer) - 1;
    if (
      isNaN(answerIndex) ||
      answerIndex < 0 ||
      answerIndex >= trivia.answers.length
    ) {
      return null; // Silent fail for invalid answer number
    }

    const selectedAnswer = trivia.answers[answerIndex];
    if (selectedAnswer === trivia.correctAnswer) {
      clearTriviaState(channel);
      startTriviaCooldown(channel);
      return `@${userstate.username} is CORRECT! The answer was ${trivia.correctAnswer} FeelsOkayMan`;
    }

    return null; // Silent fail for incorrect answer
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
