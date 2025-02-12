import { ParsedDynamicMessage } from "./types.js";

export function generateRandomItem<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Array cannot be empty");
  }
  return array[Math.floor(Math.random() * array.length)]!;
}

export function parseMessageDynamically(message: string): ParsedDynamicMessage {
  if (!message.trim()) {
    throw new Error("Message cannot be empty or whitespace only.");
  }

  const words = message.split(" ");
  const dynamicResult: ParsedDynamicMessage = {};

  words.forEach((word, index) => {
    const key = `${ordinal(index + 1)}Word`; // e.g., firstWord, secondWord
    dynamicResult[key] = word;
  });

  return dynamicResult;
}

export function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = n % 100;
  return `${n}${suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]}`;
}

export function removeCommand(message: string): string {
  const firstSpaceIndex = message.indexOf(" ");
  return firstSpaceIndex === -1 ? "" : message.substring(firstSpaceIndex + 1);
}
