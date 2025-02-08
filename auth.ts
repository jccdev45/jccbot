import dotenv from "dotenv";

import {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  TWITCH_REDIRECT_URI,
} from "./config";

dotenv.config();

let accessToken: string | null = process.env.TWITCH_BOT_TOKEN || null;
let refreshToken: string | null = process.env.TWITCH_BOT_REFRESH_TOKEN || null;
let tokenExpirationTime: number | null = null;

export function getAuthorizationUrl(): string {
  const scopes = ["chat:read", "chat:edit", "channel:moderate"];
  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    redirect_uri: TWITCH_REDIRECT_URI,
    response_type: "code",
    scope: scopes.join(" "),
  });

  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

export async function getAccessTokenFromCode(code: string): Promise<void> {
  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: TWITCH_REDIRECT_URI,
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });

  if (!response.ok) {
    throw new Error("Failed to obtain access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  console.log("New access token:", accessToken);
  console.log("New refresh token:", refreshToken);
  console.log(
    "Please update these in your .env file or deployment environment."
  );
}

async function refreshAccessToken(): Promise<void> {
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const params = new URLSearchParams({
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: params,
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  console.log("New access token:", accessToken);
  console.log("New refresh token:", refreshToken);
  console.log(
    "Please update these in your .env file or deployment environment."
  );
}

export async function getValidAccessToken(): Promise<string> {
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

export async function validateToken(token: string): Promise<boolean> {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      Authorization: `OAuth ${token}`,
    },
  });

  return response.ok;
}
