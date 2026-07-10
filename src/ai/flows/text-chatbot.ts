'use server';

/**
 * @fileOverview A chatbot for answering questions about plants, doshas, and Ayurvedic principles.
 *
 * - textChatbot - A function that handles the chatbot conversation.
 * - TextChatbotInput - The input type for the textChatbot function.
 * - TextChatbotOutput - The return type for the textChatbot function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';

const TextChatbotInputSchema = z.object({
  message: z.string().describe("The user's message or question."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The conversation history.'),
});
export type TextChatbotInput = z.infer<typeof TextChatbotInputSchema>;

const TextChatbotOutputSchema = z.object({
  response: z.string().describe('The text response from the chatbot.'),
  error: z.string().optional(),
});
export type TextChatbotOutput = z.infer<typeof TextChatbotOutputSchema>;

export async function textChatbot(input: TextChatbotInput): Promise<TextChatbotOutput> {
  return textChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'textChatbotPrompt',
  input: {schema: TextChatbotInputSchema},
  output: {schema: z.object({ response: z.string() })},
  prompt: `You are AyurBot Sage, a wise and helpful Ayurvedic wellness expert.
Answer the user's questions about medicinal plants, health, doshas (Vata, Pitta, Kapha), and general Ayurvedic principles.
Provide informative, compassionate, and practical advice. Keep your response conversational, concise, and safe.

Conversation History:
{{#each history}}
{{role}}: {{content}}
{{/each}}

User: {{{message}}}
AyurBot Sage:`,
});

const textChatbotFlow = ai.defineFlow(
  {
    name: 'textChatbotFlow',
    inputSchema: TextChatbotInputSchema,
    outputSchema: TextChatbotOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return { response: output!.response };
    } catch (e) {
      return { response: '', error: getAiErrorMessage(e) };
    }
  }
);
