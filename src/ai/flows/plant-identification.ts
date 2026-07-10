'use server';
/**
 * @fileOverview Identifies a plant from a photo and provides its name and key uses.
 *
 * - identifyPlantFromPhoto - A function that handles the plant identification process.
 * - PlantIdentificationInput - The input type for the identifyPlantFromPhoto function.
 * - PlantIdentificationOutput - The return type for the identifyPlantFromPhoto function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const PlantIdentificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PlantIdentificationInput = z.infer<typeof PlantIdentificationInputSchema>;

const PlantIdentificationOutputSchema = z.object({
  plantName: z.string().describe('The common name of the identified plant.'),
  keyUses: z.string().describe('Key uses of the identified plant.'),
  error: z.string().optional(),
});
export type PlantIdentificationOutput = z.infer<typeof PlantIdentificationOutputSchema>;

export async function identifyPlantFromPhoto(input: PlantIdentificationInput): Promise<PlantIdentificationOutput> {
  return identifyPlantFromPhotoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'plantIdentificationPrompt',
  input: {schema: PlantIdentificationInputSchema},
  output: {schema: z.object({ plantName: z.string(), keyUses: z.string() })},
  prompt: `You are an expert in identifying Indian medicinal plants.

  Based on the photo provided, identify the plant and provide its common name and key uses.

  Here is the photo of the plant:
  {{media url=photoDataUri}}

  Make sure the plant is one of the 30 common Indian medicinal plants.
  If it is not, respond with "Unknown plant".`,
});

const identifyPlantFromPhotoFlow = ai.defineFlow(
  {
    name: 'identifyPlantFromPhotoFlow',
    inputSchema: PlantIdentificationInputSchema,
    outputSchema: PlantIdentificationOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return { plantName: output!.plantName, keyUses: output!.keyUses };
    } catch (e) {
      return { plantName: '', keyUses: '', error: getAiErrorMessage(e) };
    }
  }
);
