'use server';
/**
 * @fileOverview Analyzes a photo of a meal and provides dietary advice based on the user's prakriti.
 *
 * - analyzeFoodFromPhoto - A function that handles the food analysis process.
 * - FoodScannerInput - The input type for the analyzeFoodFromPhoto function.
 * - FoodScannerOutput - The return type for the analyzeFoodFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const FoodScannerInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    prakriti: z
    .string()
    .describe("The user's prakriti (constitution) - Vata, Pitta, Kapha, or a combination."),
});
export type FoodScannerInput = z.infer<typeof FoodScannerInputSchema>;

const FoodScannerOutputSchema = z.object({
  foodItems: z.array(z.string()).describe('A list of identified food items in the meal.'),
  isHealthy: z.boolean().describe('Whether the meal is considered healthy for the given prakriti.'),
  advice: z.string().describe('Dietary advice and analysis of the meal based on the user\'s prakriti.'),
  error: z.string().optional(),
});
export type FoodScannerOutput = z.infer<typeof FoodScannerOutputSchema>;

export async function analyzeFoodFromPhoto(input: FoodScannerInput): Promise<FoodScannerOutput> {
  return foodScannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'foodScannerPrompt',
  input: {schema: FoodScannerInputSchema},
  output: {schema: z.object({ foodItems: z.array(z.string()), isHealthy: z.boolean(), advice: z.string() })},
  prompt: `You are an expert Ayurvedic nutritionist. Analyze the meal in the provided photo for a person with a "{{prakriti}}" constitution.

  Here is the photo of the meal:
  {{media url=photoDataUri}}

  1.  Identify the main food items in the photo.
  2.  Determine if this meal is generally healthy and balancing for a "{{prakriti}}" constitution.
  3.  Provide a brief analysis and advice (2-4 sentences). Explain why the meal is or isn't suitable and suggest any modifications or alternatives. For example, if it's a salad for a Vata person, you might suggest adding a warm dressing or cooked elements.
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

const foodScannerFlow = ai.defineFlow(
  {
    name: 'foodScannerFlow',
    inputSchema: FoodScannerInputSchema,
    outputSchema: FoodScannerOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return { foodItems: output!.foodItems, isHealthy: output!.isHealthy, advice: output!.advice };
    } catch (e) {
      return { foodItems: [], isHealthy: false, advice: '', error: getAiErrorMessage(e) };
    }
  }
);
