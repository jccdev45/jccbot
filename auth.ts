import { existsSync, readFileSync, writeFileSync } from "fs";

import {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  TWITCH_REDIRECT_URI,
} from "./config";

import type { TokenResponse } from "./types";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpirationTime: number | null = null;

function loadTokens() {
  if (!existsSync("tokens.json")) {
    console.log(
      "tokens.json does not exist. Will create it when tokens are obtained."
    );
    return;
  }
  try {
    const fileContent = readFileSync("tokens.json", "utf8");
    if (fileContent.trim() === "") {
      console.log(
        "tokens.json is empty. Will populate it when tokens are obtained."
      );
      return;
    }
    const data = JSON.parse(fileContent);
    accessToken = data.access_token || null;
    refreshToken = data.refresh_token || null;
    tokenExpirationTime = data.expires_at || null;
  } catch (error) {
    console.error("Failed to load tokens:", error);
  }
}

function saveTokens(tokenData: TokenResponse) {
  writeFileSync("tokens.json", JSON.stringify(tokenData));
}

// Load tokens when the module is initialized
loadTokens();

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

export async function getAccessTokenFromCode(
  code: string
): Promise<TokenResponse> {
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

  const data: TokenResponse = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  return data;
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

  const data: TokenResponse = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  tokenExpirationTime = Date.now() + data.expires_in * 1000;

  saveTokens(data);
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
