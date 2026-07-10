'use server';

/**
 * @fileOverview This file defines a Genkit flow for recommending plants based on user's prakriti, health concerns, and the current season.
 *
 * - plantRecommendation - A function that handles the plant recommendation process.
 * - PlantRecommendationInput - The input type for the plantRecommendation function.
 * - PlantRecommendationOutput - The return type for the plantRecommendation function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const PlantRecommendationInputSchema = z.object({
  prakriti: z
    .string()
    .describe("The user's prakriti (constitution) - Vata, Pitta, or Kapha."),
  dominantDosha: z
    .string()
    .describe('The user primary dominant dosha.'),
  healthConcerns: z
    .string()
    .describe('Specific health concerns or ailments the user is experiencing.'),
  season: z
    .string()
    .describe('The current season (e.g., spring, summer, autumn, winter).'),
  availability: z
    .string()
    .describe('The plant availability in the users region.'),
});
export type PlantRecommendationInput = z.infer<typeof PlantRecommendationInputSchema>;

const PlantRecommendationOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of plant recommendations based on the input criteria.'),
  error: z.string().optional(),
});
export type PlantRecommendationOutput = z.infer<typeof PlantRecommendationOutputSchema>;

export async function plantRecommendation(input: PlantRecommendationInput): Promise<PlantRecommendationOutput> {
  return plantRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantRecommendationPrompt',
  input: {schema: PlantRecommendationInputSchema},
  output: {schema: z.object({ recommendations: z.array(z.string()) })},
  prompt: `Based on the user's Ayurvedic prakriti (constitution), dominant dosha, health concerns, the current season, and plant availability, recommend three plants that would be most beneficial.

User Prakriti: {{{prakriti}}}
User Dominant Dosha: {{{dominantDosha}}}
Health Concerns: {{{healthConcerns}}}
Current Season: {{{season}}}
Plant availability: {{{availability}}}

Give three recommendations. For each plant, list only the name of the plant, no other text.`,
});

const plantRecommendationFlow = ai.defineFlow(
  {
    name: 'plantRecommendationFlow',
    inputSchema: PlantRecommendationInputSchema,
    outputSchema: PlantRecommendationOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error("No output generated from the AI model.");
      return { recommendations: output.recommendations };
    } catch(e) {
      return { recommendations: [], error: getAiErrorMessage(e) };
    }
  }
);
