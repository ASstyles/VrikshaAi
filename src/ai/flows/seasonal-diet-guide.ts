'use server';
/**
 * @fileOverview A personalized seasonal diet guide generator based on prakriti and season.
 *
 * - getSeasonalDietGuide - A function that generates a diet guide.
 * - SeasonalDietGuideInput - The input type for the getSeasonalDietGuide function.
 * - SeasonalDietGuideOutput - The return type for the getSeasonalDietGuide function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const SeasonalDietGuideInputSchema = z.object({
  prakriti: z
    .string()
    .describe("The user's prakriti (Vata, Pitta, or Kapha)."),
  season: z
    .string()
    .describe('The current season (e.g., spring, summer, autumn, winter).'),
});
export type SeasonalDietGuideInput = z.infer<typeof SeasonalDietGuideInputSchema>;

const SeasonalDietGuideOutputSchema = z.object({
  introduction: z.string().describe('A brief introduction to the diet for the season and prakriti.'),
  foodsToFavor: z.array(z.string()).describe('A list of foods to favor.'),
  foodsToAvoid: z.array(z.string()).describe('A list of foods to avoid.'),
  error: z.string().optional(),
});
export type SeasonalDietGuideOutput = z.infer<typeof SeasonalDietGuideOutputSchema>;

export async function getSeasonalDietGuide(input: SeasonalDietGuideInput): Promise<SeasonalDietGuideOutput> {
  return seasonalDietGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seasonalDietGuidePrompt',
  input: {schema: SeasonalDietGuideInputSchema},
  output: {schema: z.object({ introduction: z.string(), foodsToFavor: z.array(z.string()), foodsToAvoid: z.array(z.string()) })},
  prompt: `You are an expert Ayurvedic nutritionist. Provide a personalized seasonal diet guide based on the user's prakriti and the current season.

Prakriti: {{{prakriti}}}
Season: {{{season}}}

Provide the following:
1. A brief introduction (2-3 sentences) explaining the dietary principles for this prakriti during this season.
2. A list of 5-7 "Foods to Favor".
3. A list of 5-7 "Foods to Avoid".

Keep the food lists as bullet points of specific food items (e.g., "Apples", "Quinoa", "Leafy Greens").
`,
config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const seasonalDietGuideFlow = ai.defineFlow(
  {
    name: 'seasonalDietGuideFlow',
    inputSchema: SeasonalDietGuideInputSchema,
    outputSchema: SeasonalDietGuideOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return {
            introduction: output!.introduction,
            foodsToFavor: output!.foodsToFavor,
            foodsToAvoid: output!.foodsToAvoid,
        };
    } catch (e) {
        return { introduction: '', foodsToFavor: [], foodsToAvoid: [], error: getAiErrorMessage(e) };
    }
  }
);
