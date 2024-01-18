"use client";
import React from "react";
import { PageHeader } from "../components/PageHeader";
import { api } from "~/trpc/react";

// const skills = [
//   {
//     name: "TypeScript",
//     timeFrame: "2 years",
//   },
//   {
//     name: "React",
//     timeFrame: "4 years",
//   },
// ];

export default function Skills() {
  const [skillsPrompt, setSkillsPrompt] = React.useState("");
  const [skillsPromptResponse, setSkillsPromptResponse] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const getSkillsResponse = api.skills.getSkills.useMutation();

  const onInputSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setSkillsPromptResponse("");
      const data = await getSkillsResponse.mutateAsync({
        prompt: skillsPrompt,
      });
      setSkillsPromptResponse(data ?? "Oops something went wrong");
    } catch (error) {
      let errorMessage = "Ooops something went wrong";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      setSkillsPromptResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <section className="rounded-lg bg-gradient-to-b from-zinc-700 to-black p-4">
      <div>
        <PageHeader
          pageName={"Skills"}
          pageImagePath="/skills.png"
          authorName="Software Engineer"
        />
      </div>
      <div className="flex w-full flex-col items-center justify-start self-center pt-4">
        <p className="mb-4 text-center text-lg">
          {
            "Tired of reading resumes or LinkedIn? Go ahead and ask my AI assistant about my skills"
          }
        </p>
        <form
          onSubmit={async (e) => await onInputSubmit(e)}
          className="flex w-full flex-col items-center"
        >
          <input
            onChange={(e) => setSkillsPrompt(e.target.value)}
            type="text"
            className="mb-2 w-full rounded-full bg-black p-4 text-white"
            placeholder="What role are you hiring for / skills are you looking for?"
          />
          <button
            disabled={isLoading}
            type="submit"
            className="w-full rounded-full bg-blue-500 px-4 py-2 text-white"
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
        {skillsPromptResponse && (
          <div className="mt-3 rounded-md bg-gray-300 p-4">
            <p className="text-black">{skillsPromptResponse}</p>
          </div>
        )}
      </div>
    </section>
  );
}
