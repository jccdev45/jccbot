import dotenv from "dotenv";

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "./config.js";
import { SCOPES, SPOTIFY_REDIRECT_URI } from "./constants.js";

dotenv.config();

let accessToken: string | null = process.env.SPOTIFY_ACCESS_TOKEN || null;
let refreshToken: string | null = process.env.SPOTIFY_REFRESH_TOKEN || null;
let tokenExpirationTime: number | null = null;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const CURRENT_SONG_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

export function getSpotifyAuthURL(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES.join(" "),
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getSpotifyAccessToken(code: string): Promise<void> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to obtain access token: ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  console.log("New access token obtained");
}

async function refreshAccessToken(): Promise<void> {
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh access token: ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  if (data.refresh_token) {
    refreshToken = data.refresh_token;
  }
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  console.log("Access token refreshed");
}

async function getValidAccessToken(): Promise<string> {
  if (
    !accessToken ||
    !tokenExpirationTime ||
    Date.now() >= tokenExpirationTime
  ) {
    if (refreshToken) {
      await refreshAccessToken();
    } else {
      throw new Error(
        "No access token or refresh token available. Please run the authorization process."
      );
    }
  }

  if (!accessToken) {
    throw new Error("Failed to obtain a valid access token");
  }

  return accessToken;
}

export async function getCurrentSong(): Promise<string> {
  try {
    const token = await getValidAccessToken();

    const response = await fetch(CURRENT_SONG_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch current song: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.item) {
      return "No song is currently playing.";
    }

    const songName = data.item.name;
    const artistName = data.item.artists[0].name;
    const albumName = data.item.album.name;

    return `🎶: "${songName}" by ${artistName} from the album "${albumName}"`;
  } catch (error) {
    console.error("Error fetching current song:", error);
    return "Unable to fetch current song information.";
  }
}
