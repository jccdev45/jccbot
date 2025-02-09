import { config } from "dotenv";

config();

export const TWITCH_BOT_USERNAME = process.env.TWITCH_BOT_USERNAME!;
export const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL!;
export const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
export const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
export const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI!;
export const TWITCH_USER_ID = process.env.TWITCH_USER_ID!;
export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
export const SPOTIFY_ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN!;
export const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;
