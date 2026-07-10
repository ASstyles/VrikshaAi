'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating planting and care instructions for a given plant.
 *
 * - getPlantingInstructions - A function that handles the instruction generation process.
 * - PlantingInstructionsInput - The input type for the getPlantingInstructions function.
 * - PlantingInstructionsOutput - The return type for the getPlantingInstructions function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const PlantingInstructionsInputSchema = z.object({
  plantName: z.string().describe('The common name of the plant.'),
});
export type PlantingInstructionsInput = z.infer<typeof PlantingInstructionsInputSchema>;

const PlantingInstructionsOutputSchema = z.object({
  planting: z.string().describe('Instructions on how to plant the seed or sapling.'),
  care: z.string().describe('Instructions on how to care for the plant, including watering, sunlight, and soil needs.'),
  error: z.string().optional(),
});
export type PlantingInstructionsOutput = z.infer<typeof PlantingInstructionsOutputSchema>;

export async function getPlantingInstructions(input: PlantingInstructionsInput): Promise<PlantingInstructionsOutput> {
  return plantingInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantingInstructionsPrompt',
  input: {schema: PlantingInstructionsInputSchema},
  output: {schema: z.object({ planting: z.string(), care: z.string() })},
  prompt: `You are an expert gardener specializing in Ayurvedic plants. For the plant "{{plantName}}", provide simple, clear, and concise instructions for a home gardener.

  Provide two sets of instructions:
  1.  **Planting**: How to plant it (e.g., from seed or sapling, soil type, depth, spacing).
  2.  **Care**: How to take care of it (e.g., watering frequency, sunlight requirements, and basic maintenance).

  Keep each section to 2-3 sentences.
  `,
});

const plantingInstructionsFlow = ai.defineFlow(
  {
    name: 'plantingInstructionsFlow',
    inputSchema: PlantingInstructionsInputSchema,
    outputSchema: PlantingInstructionsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return { planting: output!.planting, care: output!.care };
    } catch(e) {
      const errorMessage = getAiErrorMessage(e);
      return { planting: '', care: '', error: `Could not generate instructions. ${errorMessage}` };
    }
  }
);
