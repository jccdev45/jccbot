import fs from "fs/promises";

import { TWITCH_USER_ID } from "./config";

const EMOTES_FILE = "channel_emotes.txt";

async function get7TVChannelEmotes(twitchUserId: string): Promise<string[]> {
  const response = await fetch(
    `https://7tv.io/v3/users/twitch/${twitchUserId}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log("7TV API Response:", JSON.stringify(data, null, 2));

  if (!data.emote_set || !data.emote_set.emotes) {
    console.warn("No emotes found in 7TV response");
    return [];
  }
  console.log("🚀 emotes ", data.emote_set.emotes);
  return data.emote_set.emotes.map((emote: any) => emote.name);
}

export async function fetchAndUpdateEmotes(): Promise<string[]> {
  try {
    const channelEmotes = await get7TVChannelEmotes(TWITCH_USER_ID);

    if (channelEmotes.length > 0) {
      await fs.writeFile(EMOTES_FILE, channelEmotes.join("\n"));
      console.log(`Updated emotes file with ${channelEmotes.length} emotes`);
      return channelEmotes;
    } else {
      console.warn("No channel emotes found");
      // If no new emotes are found, read and return existing emotes
      return await getStoredEmotes();
    }
  } catch (error) {
    console.error("Error in fetchAndUpdateEmotes:", error);
    // If there's an error, try to read existing emotes from the file
    return await getStoredEmotes();
  }
}

export async function getStoredEmotes(): Promise<string[]> {
  try {
    const data = await fs.readFile(EMOTES_FILE, "utf-8");
    const emotes = data.split("\n").filter((emote) => emote.trim() !== "");
    if (emotes.length === 0) {
      console.warn("Emotes file is empty");
    }
    return emotes;
  } catch (error) {
    console.error("Error reading emotes file:", error);
    return [];
  }
}

export async function getRandomEmote(): Promise<string> {
  const emotes = await getStoredEmotes();
  if (emotes.length === 0) {
    throw new Error("No emotes available");
  }
  return emotes[Math.floor(Math.random() * emotes.length)];
}
