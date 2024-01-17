import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { openai } from "~/server/openai";
import { SkillSummary } from "../helpers/skills";

export const skillsRouter = createTRPCRouter({
  getSkills: publicProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const { prompt } = input;
      const skillsResponse = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Given the following Information about Hugh Gardiner, how would you respond to the following prompt:
            Informtation: "${SkillSummary}"
            Prompt = "${prompt}"`,
          },
        ],
        model: "gpt-3.5-turbo",
      });
      return (
        skillsResponse.choices[0]?.message.content ??
        "Oops something went wrong. Please try again later"
      );
    }),
});
