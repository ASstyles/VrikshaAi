'use server';

/**
 * @fileOverview A voice-enabled chatbot for answering questions about plants, doshas, and Ayurvedic principles.
 *
 * - voiceChatbot - A function that handles the chatbot conversation.
 * - VoiceChatbotInput - The input type for the voiceChatbot function.
 * - VoiceChatbotOutput - The return type for the voiceChatbot function.
 */

import {ai} from '@/ai/genkit';
import { getAiErrorMessage } from '@/lib/utils';
import {z} from 'genkit';
import wav from 'wav';

const VoiceChatbotInputSchema = z.object({
  message: z.string().describe("The user's voice prompt or question."),
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
export type VoiceChatbotInput = z.infer<typeof VoiceChatbotInputSchema>;

const VoiceChatbotOutputSchema = z.object({
  response: z.string().describe('The text response from the chatbot.'),
  audio: z.string().optional().describe('The base64 encoded WAV audio of the response.'),
  error: z.string().optional(),
});
export type VoiceChatbotOutput = z.infer<typeof VoiceChatbotOutputSchema>;

export async function voiceChatbot(input: VoiceChatbotInput): Promise<VoiceChatbotOutput> {
  return voiceChatbotFlow(input);
}

async function toWav(pcmBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      sampleRate: 24000,
      channels: 1,
      bitDepth: 16,
    });
    const chunks: Buffer[] = [];
    writer.on('data', chunk => chunks.push(chunk));
    writer.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    writer.on('error', err => reject(err));
    writer.write(pcmBuffer);
    writer.end();
  });
}

const textPrompt = ai.definePrompt({
  name: 'voiceChatbotTextPrompt',
  input: {schema: VoiceChatbotInputSchema},
  prompt: `You are AyurBot Voice, a friendly and warm Ayurvedic wellness assistant.
You speak clearly and warmly. Keep your answers brief, informative, and friendly.

Conversation History:
{{#each history}}
{{role}}: {{content}}
{{/each}}

User: {{{message}}}
AyurBot Voice:`,
});

const audioPrompt = ai.definePrompt({
  name: 'voiceChatbotAudioPrompt',
  model: 'googleai/gemini-2.5-flash-preview-tts',
  input: z.object({ text: z.string() }),
  prompt: `Read the following text aloud: {{{text}}}`,
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Algenib' },
      },
    },
  },
});

const voiceChatbotFlow = ai.defineFlow(
  {
    name: 'voiceChatbotFlow',
    inputSchema: VoiceChatbotInputSchema,
    outputSchema: VoiceChatbotOutputSchema,
  },
  async input => {
    try {
      const textResponse = await textPrompt(input);
      const generatedText = textResponse.text;

      let audioBase64: string | undefined;

      if (generatedText) {
        const audioResponse = await audioPrompt({ text: generatedText });
        const content = audioResponse.message?.content;
        const mediaPart = content?.find((p: any) => p.media?.contentType?.startsWith('audio/')) as any;

        if (mediaPart?.media?.url) {
          const base64Data = mediaPart.media.url.split('base64,')[1];
          const pcmBuffer = Buffer.from(base64Data, 'base64');
          const wavBase64 = await toWav(pcmBuffer);
          audioBase64 = 'data:audio/wav;base64,' + wavBase64;
        }
      }

      return {
        response: generatedText,
        audio: audioBase64,
      };
    } catch (e) {
      return { response: '', error: getAiErrorMessage(e) };
    }
  }
);
