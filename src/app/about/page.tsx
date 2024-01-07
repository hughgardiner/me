"use client";
import React from "react";
import { PageHeader } from "../components/PageHeader";
import { api } from "~/trpc/react";

export default function About() {
  const [suggestedSongPrompt, setSuggestedSongPrompt] = React.useState("");
  const [suggestedSongResponse, setSuggestedSongResponse] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const getSuggestedSong = api.spotify.getSuggestedSongs.useMutation();

  const onInputSubmit = async (_e: React.FormEvent<HTMLButtonElement>) => {
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
        <input
          onChange={(e) => setSuggestedSongPrompt(e.target.value)}
          type="text"
          className="w-3/4 rounded-full bg-black p-4 text-white"
          placeholder="Describe the type of music you're in the mood for"
        />
        <button
          disabled={isLoading}
          className="flex-1 my-3 ml-2 rounded-full bg-blue-500 px-4 py-2 text-white"
          onClick={onInputSubmit}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
        {suggestedSongResponse && (
          <div className="rounded-md bg-gray-300 p-4">
            <p className="text-black">{suggestedSongResponse}</p>
          </div>
        )}
      </div>
    </section>
  );
}
