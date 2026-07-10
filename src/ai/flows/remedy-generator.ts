'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating Ayurvedic remedies.
 *
 * - getRemedy - A function that handles the remedy generation process.
 * - GetRemedyInput - The input type for the getRemedy function.
 * - GetRemedyOutput - The return type for the getRemedy function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const GetRemedyInputSchema = z.object({
  prakriti: z
    .string()
    .describe("The user's prakriti (constitution) - Vata, Pitta, or Kapha."),
  ailment: z
    .string()
    .describe('The ailment the user is experiencing.'),
});
export type GetRemedyInput = z.infer<typeof GetRemedyInputSchema>;

const GetRemedyOutputSchema = z.object({
  remedy: z
    .string()
    .describe('A personalized Ayurvedic remedy for the ailment.'),
  error: z.string().optional(),
});
export type GetRemedyOutput = z.infer<typeof GetRemedyOutputSchema>;

export async function getRemedy(input: GetRemedyInput): Promise<GetRemedyOutput> {
  return remedyGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'remedyGeneratorPrompt',
  input: {schema: GetRemedyInputSchema},
  output: {schema: z.object({ remedy: z.string() })},
  prompt: `You are an expert Ayurvedic practitioner. Based on the user's prakriti and their ailment, provide a simple, safe, and effective home remedy.

User Prakriti: {{{prakriti}}}
Ailment: {{{ailment}}}

Provide a concise remedy. The remedy should use commonly available ingredients. Explain the steps clearly. Also, add a small disclaimer that this is not a substitute for professional medical advice.
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

const remedyGeneratorFlow = ai.defineFlow(
  {
    name: 'remedyGeneratorFlow',
    inputSchema: GetRemedyInputSchema,
    outputSchema: GetRemedyOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return { remedy: output!.remedy };
    } catch(e) {
      return { remedy: '', error: getAiErrorMessage(e) };
    }
  }
);
