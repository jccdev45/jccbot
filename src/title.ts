import { getValidAccessToken } from "./auth.js";
import { TWITCH_CLIENT_ID, TWITCH_USER_ID } from "./config.js";

export async function getChannelTitle(
  channel: string,
  username?: string
): Promise<string> {
  try {
    const token = await getValidAccessToken();

    const channelResponse = await fetch(
      `https://api.twitch.tv/helix/channels?broadcaster_id=${TWITCH_USER_ID}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const channelData = await channelResponse.json();
    return `@${username} Title for ${channel.replace("#", "")}: ${
      channelData.data[0].title
    }`;
  } catch (error) {
    console.error("Error fetching channel title: ", error);
    return "";
  }
}
