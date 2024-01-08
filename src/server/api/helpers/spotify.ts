import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { env } from "~/env.mjs";
import { spotify } from "~/server/db/spotify";

const BASE_URL = "https://api.spotify.com/v1";

export function getSpotifyLoginUrl() {
  const scopes = [
    "user-top-read",
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
  ];
  const clientId = env.SPOTIFY_CLIENT_ID;
  const redirectUri = env.SPOTIFY_REDIRECT_URI;
  const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes.join(
    "%20",
  )}&redirect_uri=${redirectUri}`;
  return url;
}

interface SuccessfulTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface SpotifyApiError {
  error: string;
  error_description: string;
}

export type TokenResponse = SuccessfulTokenResponse | SpotifyApiError;

type SpotifyResponse<T extends object> = T | SpotifyApiError;

function validateResponse<T extends object>(response: SpotifyResponse<T>) {
  if ("error" in response) {
    throw new Error(`${response.error}:  ${response.error_description}`);
  }
  return response;
}

export async function getSpotifyTokens(code: string) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      // FIXME: make env vars required
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI ?? "",
      client_id: process.env.SPOTIFY_CLIENT_ID ?? "",
      client_secret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  const response = validateResponse((await res.json()) as TokenResponse);
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresIn: response.expires_in,
  };
}

interface SpotifyApiParams {
  id?: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  lastRefreshedAt?: Date;
}

export class SpotifyApi {
  private id?: string;
  private accessToken: string;
  private refreshToken?: string;
  private lastRefreshedAt?: Date | null = null;
  private expiresIn: number;

  constructor({
    id,
    accessToken,
    refreshToken,
    expiresIn,
    lastRefreshedAt,
  }: SpotifyApiParams) {
    this.id = id;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn;
    this.lastRefreshedAt = lastRefreshedAt;
  }

  private async refreshAccessTokenIfNeeded() {
    if (!this.lastRefreshedAt) {
      await this.refreshAccessToken();
    } else {
      const now = new Date();
      const timeSinceLastRefresh =
        now.getTime() - this.lastRefreshedAt.getTime();
      const timeUntilExpiration = this.expiresIn * 1000 - timeSinceLastRefresh;
      if (timeUntilExpiration < 0) {
        await this.refreshAccessToken();
      }
    }
  }

  private async refreshAccessToken() {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken ?? "",
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString("base64")}`,
      },
    });
    const { access_token, refresh_token, expires_in } = validateResponse(
      (await res.json()) as TokenResponse,
    );
    const lastRefreshedAt = new Date();
    this.accessToken = access_token;
    this.refreshToken = refresh_token ?? this.refreshToken;
    this.expiresIn = expires_in;
    this.lastRefreshedAt = lastRefreshedAt;

    const { id } = await this.getMe();
    this.id = id;
    await db
      .update(spotify)
      .set({
        accessToken: access_token,
        refreshToken: refresh_token ?? this.refreshToken,
        expiresIn: expires_in,
        updatedAt: lastRefreshedAt,
      })
      .where(eq(spotify.id, this.id));
  }

  async getMe() {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    const response = (await res.json()) as {
      id: string;
      email: string;
    };
    return {
      id: response.id,
      email: response.email,
    };
  }

  async getPlaybackState() {
    await this.refreshAccessTokenIfNeeded();
    const res = await fetch(
      `${BASE_URL}/me/player?` +
        new URLSearchParams({
          market: "US",
        }).toString(),
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    const response = (await res.json()) as {
      is_playing: boolean;
      item: {
        name: string;
        artists: { name: string }[];
        album: {
          name: string;
          images: { url: string }[];
        };
      };
    };

    return {
      song: response.item.name,
      artist: response.item.artists[0]?.name ?? "Unknown",
      album: response.item.album.name,
      albumImageUrl: response.item.album.images[0]?.url ?? "",
    };
  }

  async getTopSongs() {
    await this.refreshAccessTokenIfNeeded();
    const res = await fetch(
      `${BASE_URL}/me/top/tracks?` +
        new URLSearchParams({
          time_range: "medium_term",
          limit: "50",
        }).toString(),
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const response = (await res.json()) as {
      items: {
        name: string;
        artists: { name: string }[];
        album: {
          name: string;
          images: { url: string }[];
        };
      }[];
    };
    console.log("response: ", response);

    return response.items.map((item) => ({
      song: item.name,
      artist: item.artists[0]?.name ?? "Unknown",
      album: item.album.name,
      albumImageUrl: item.album.images[0]?.url ?? "",
    }));
  }

  async getPlaylistByName(name: string) {
    await this.refreshAccessTokenIfNeeded();
    let playlist = null;
    let offset = 0;
    do {
      const res = await fetch(
        `${BASE_URL}/me/playlists?` +
          new URLSearchParams({
            market: "US",
            offset: offset.toString(),
            limit: "50",
          }).toString(),
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      );
      const response = (await res.json()) as {
        items: {
          id: string;
          name: string;
        }[];
        next: string | null;
      };
      console.log("response", response);

      playlist = response.items.find((item) => item.name === name);
      if (!playlist) {
        if (!response.next) {
          throw new Error("No more playlists to search through");
        }
        offset += 50;
      }
    } while (!playlist);
    return playlist;
  }

  async getPlaylistTracks(playlistId: string) {
    await this.refreshAccessTokenIfNeeded();
    const res = await fetch(
      `${BASE_URL}/playlists/${playlistId}/tracks?` +
        new URLSearchParams({
          market: "US",
        }).toString(),
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );
    const response = (await res.json()) as {
      items: {
        track: {
          id: string;
          name: string;
          artists: { name: string }[];
          album: {
            name: string;
            images: { url: string }[];
          };
        };
      }[];
    };

    return response.items.map((item) => ({
      id: item.track.id,
      song: item.track.name,
      artist: item.track.artists[0]?.name ?? "Unknown",
      album: item.track.album.name,
      albumImageUrl: item.track.album.images[0]?.url ?? "",
    }));
  }
}
