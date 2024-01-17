"use client";
import React from "react";
import { PageHeader } from "../components/PageHeader";
import { api } from "~/trpc/react";

export default function About() {
  const [suggestedSongPrompt, setSuggestedSongPrompt] = React.useState("");
  const [suggestedSongResponse, setSuggestedSongResponse] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const getSuggestedSong = api.spotify.getSuggestedSongs.useMutation();

  const onInputSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setSuggestedSongResponse("");
      const data = await getSuggestedSong.mutateAsync({
        prompt: suggestedSongPrompt,
      });
      setSuggestedSongResponse(data ?? "Oops something went wrong");
    } catch (error) {
      let errorMessage = "Ooops something went wrong";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      setSuggestedSongResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-start justify-start rounded-lg bg-gradient-to-b from-liked to-black p-4">
      <div>
        <PageHeader pageName={"About Me"} pageImagePath="/aboutMeBig.png" />
      </div>
      <div className="flex w-full flex-col items-center justify-start self-center pt-4">
        <p className="mb-4 text-center text-lg">
          {
            "I would love to share my recent music favorites with you! Go ahead and prompt the AI below with what you're in the mood for, and you'll get a suggestion from my Spotify Top 50 in the last 6 months."
          }
        </p>
        <form
          onSubmit={async (e) => await onInputSubmit(e)}
          className="flex w-full flex-col items-center"
        >
          <input
            onChange={(e) => setSuggestedSongPrompt(e.target.value)}
            type="text"
            className="mb-2 w-full rounded-full bg-black p-4 text-white"
            placeholder="What are you in the mood for?"
          />
          <button
            disabled={isLoading}
            type="submit"
            className="w-full rounded-full bg-blue-500 px-4 py-2 text-white"
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
        {suggestedSongResponse && (
          <div className="mt-3 rounded-md bg-gray-300 p-4">
            <p className="text-black">{suggestedSongResponse}</p>
          </div>
        )}
      </div>
    </section>
  );
}
