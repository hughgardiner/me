import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { spotify } from "~/server/db/spotify";

import {
  SpotifyApi,
  getSpotifyLoginUrl,
  getSpotifyTokens,
} from "../helpers/spotify";
import { z } from "zod";
import { db } from "~/server/db";
import { openai } from "~/server/openai";

const listOfSongs = [
  "Levels by Avicii",
  "Feel Something by Illenium",
  "All the Small Things by Blink 182",
  "When You Were Young by the Killers",
];
export const spotifyRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ code: z.string().nullable() }))
    .query(async ({ input }) => {
      const { code } = input;
      if (code) {
        const { accessToken, refreshToken, expiresIn } =
          await getSpotifyTokens(code);
        const spotifyApi = new SpotifyApi({
          accessToken,
          refreshToken,
          expiresIn,
          lastRefreshedAt: new Date(),
        });
        const requestedUser = await spotifyApi.getMe();
        if (requestedUser.email !== "hughg6@vt.edu") {
          throw new Error("Sorry, you are not authorized to use this app.");
        } else {
          await db
            .insert(spotify)
            .values({
              id: requestedUser.id,
              email: requestedUser.email,
              accessToken: accessToken,
              refreshToken: refreshToken ?? "",
              expiresIn,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: spotify.id,
              set: {
                email: requestedUser.email,
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresIn,
                updatedAt: new Date(),
              },
            });
        }
      } else {
        return getSpotifyLoginUrl();
      }
    }),
  getNowPlaying: publicProcedure.query(async () => {
    // hack until i can figure out filtering on drizzle
    try {
      const getMySpotify = await db.select().from(spotify);
      const mySpotify = getMySpotify[0];

      if (!mySpotify) {
        throw new Error("Missing Spotify token");
      }
      const spotifyApi = new SpotifyApi({
        id: mySpotify.id,
        accessToken: mySpotify.accessToken,
        refreshToken: mySpotify.refreshToken,
        expiresIn: mySpotify.expiresIn,
        lastRefreshedAt: mySpotify.updatedAt,
      });
      const nowPlaying = await spotifyApi.getPlaybackState();
      return nowPlaying;
    } catch (error) {
      console.log("Error: ", error);
      return {
        song: "Levels",
        artist: "Avicii",
        album: "",
        albumImageUrl: "",
      };
    }
  }),
  getSuggestedSongs: publicProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const getMySpotify = await db.select().from(spotify);
      const mySpotify = getMySpotify[0];

      if (!mySpotify) {
        throw new Error("Missing Spotify token");
      }
      let songs = listOfSongs;
      const spotifyApi = new SpotifyApi({
        id: mySpotify.id,
        accessToken: mySpotify.accessToken,
        refreshToken: mySpotify.refreshToken,
        expiresIn: mySpotify.expiresIn,
        lastRefreshedAt: mySpotify.updatedAt,
      });
      console.log('About to fetch');
      const myTopSongs = await spotifyApi.getTopSongs();
      console.log("Top Songs: ", myTopSongs);
      if (myTopSongs) {
        songs = myTopSongs.map((song) => `${song.song} by ${song.artist}`);
        console.log('INCOMING: ', songs);
      }
      const { prompt } = input;
      console.log("Prompt received: ", prompt);
      const suggestedSongResponse = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Given this list of songs and the following prompt, what song would you recommend: List of Songs = ${songs.join(
              ", ",
            )} Prompt = ${prompt}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      console.log("suggestedSongResponse: ", suggestedSongResponse);
      return (
        suggestedSongResponse.choices[0]?.message.content ??
        "Oops something went wrong. Please try again later"
      );
    }),
});
