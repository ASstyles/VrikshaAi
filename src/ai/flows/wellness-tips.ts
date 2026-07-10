'use server';
/**
 * @fileOverview A personalized wellness tip generator based on prakriti and season.
 *
 * - getWellnessTips - A function that generates wellness tips.
 * - WellnessTipsInput - The input type for the getWellnessTips function.
 * - WellnessTipsOutput - The return type for the getWellnessTips function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const WellnessTipsInputSchema = z.object({
  prakriti: z
    .string()
    .describe("The user's prakriti (Vata, Pitta, or Kapha)."),
  season: z
    .string()
    .describe('The current season (e.g., spring, summer, autumn, winter).'),
  frequency: z
    .enum(['daily', 'weekly'])
    .describe('The desired frequency of wellness tips.'),
});
export type WellnessTipsInput = z.infer<typeof WellnessTipsInputSchema>;

const WellnessTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('A list of personalized wellness tips.'),
  error: z.string().optional(),
});
export type WellnessTipsOutput = z.infer<typeof WellnessTipsOutputSchema>;

export async function getWellnessTips(input: WellnessTipsInput): Promise<WellnessTipsOutput> {
  return wellnessTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'wellnessTipsPrompt',
  input: {schema: WellnessTipsInputSchema},
  output: {schema: z.object({ tips: z.array(z.string()) })},
  prompt: `You are an Ayurvedic wellness expert. Provide personalized wellness tips based on the user's prakriti and the current season. The tips should be simple and easy to follow.

Prakriti: {{{prakriti}}}
Season: {{{season}}}
Frequency: {{{frequency}}}

Consider the following:
* Diet: Recommend foods that balance the user's dominant dosha and are appropriate for the season.
* Lifestyle: Suggest daily routines and activities that promote well-being.
* Herbal Remedies: Suggest readily accessible herbs for improved health and vitality.

Provide {{{frequency}}} wellness tips:`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const wellnessTipsFlow = ai.defineFlow(
  {
    name: 'wellnessTipsFlow',
    inputSchema: WellnessTipsInputSchema,
    outputSchema: WellnessTipsOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        return { tips: output!.tips };
    } catch (e) {
        return { tips: [], error: getAiErrorMessage(e) };
    }
  }
);
