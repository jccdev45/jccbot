import { JSDOM } from "jsdom";

import { ANSWERTIMELIMIT, TRIVIA_COOLDOWN, WARNINGTIME } from "./constants.js";

import type { ChatUserstate, Client } from "tmi.js";
import type { TriviaState } from "./types.js";

const activeTrivia: { [channel: string]: TriviaState } = {};
const triviaCooldowns: { [channel: string]: number } = {};

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

export function checkTriviaTimeouts(channel: string, client: Client) {
  let warningSent = false;
  let intervalId: NodeJS.Timeout | null = null;

  const checkTimeout = () => {
    const triviaState = getTriviaState(channel);
    if (!triviaState) {
      if (intervalId) clearInterval(intervalId);
      return;
    }

    const elapsed = Date.now() - triviaState.startTime;

    if (elapsed >= ANSWERTIMELIMIT) {
      clearTriviaState(channel);
      startTriviaCooldown(channel);
      client.say(
        channel,
        `Time's up! The correct answer was ${triviaState.correctAnswer} AsukaThumbsDown`
      );
      if (intervalId) clearInterval(intervalId);
    } else if (elapsed >= ANSWERTIMELIMIT - WARNINGTIME && !warningSent) {
      client.say(channel, "10 seconds left to answer! hurryup");
      warningSent = true;
    }
  };

  // Only start a new interval if one doesn't already exist
  if (!intervalId) {
    intervalId = setInterval(checkTimeout, 1000) as NodeJS.Timeout;
  }

  // Return a function to clear the interval
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

export async function fetchTrivia(channel: string, userstate: ChatUserstate) {
  const now = Date.now();
  const lastUsed = triviaCooldowns[channel] || 0;
  const cooldownRemaining = TRIVIA_COOLDOWN - (now - lastUsed);

  if (cooldownRemaining > 0) {
    const secondsRemaining = Math.ceil(cooldownRemaining / 1000);
    return `Trivia is on cooldown. Please wait ${secondsRemaining} second${
      secondsRemaining !== 1 ? "s" : ""
    } AngleStare`;
  }

  if (activeTrivia[channel]) {
    return "There's already an active trivia game in this channel GOODOLJR";
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
      `${question}\n` +
      answers.map((answer, index) => `${index + 1}. ${answer}`).join(" | ") +
      " | Use $a followed by your answer number!"
    );
  } catch (error) {
    console.error("Error fetching trivia question (trivia.ts): ", error);
    return `@${userstate.username} Sorry, couldn't fetch a trivia question stonecoldStunner`;
  }
}

export async function handleTriviaAnswer(
  channel: string,
  userstate: ChatUserstate,
  message: string
): Promise<string | null> {
  try {
    const trivia = getTriviaState(channel);

    if (!trivia) {
      // No active trivia session
      return null; // or return "No active trivia session." if you want to inform the user
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
      return `@${userstate.username} is CORRECT! The answer was ${trivia.correctAnswer} OrangeCassidyARRIVE`;
    }

    return null; // Silent fail for incorrect answer
  } catch (error) {
    console.error("Error handling trivia answer: ", error);
    return "An error occurred while processing your answer. Please try again later.";
  }
}
