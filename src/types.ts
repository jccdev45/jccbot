import type { ChatUserstate } from "tmi.js";
import type { commands } from "./commands.js";

export interface TriviaState {
  question: string;
  correctAnswer: string;
  answers: string[];
  startTime: number;
}

export type CommandName = keyof typeof commands;

// Types for our command handlers
export type CommandHandler = (
  channel: string,
  userstate: ChatUserstate,
  message: string,
  self?: boolean
) => string | Promise<string | null>;

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string[];
  token_type: string;
}

export interface UserPoints {
  points: number;
  hasClaimedInitialPoints: boolean;
}

export interface PointsSystem {
  [username: string]: UserPoints;
}

export interface Commands {
  [key: string]: CommandHandler;
}

export interface ParsedDynamicMessage {
  [key: string]: string | undefined; // Allows dynamic keys like firstWord, secondWord, etc.
}
