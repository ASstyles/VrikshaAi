'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/plant-recommendation.ts';
import '@/ai/flows/voice-chatbot.ts';
import '@/ai/flows/plant-identification.ts';
import '@/ai/flows/wellness-tips.ts';
import '@/ai/flows/remedy-generator.ts';
import '@/ai/flows/planting-instructions.ts';
import '@/ai/flows/seasonal-diet-guide.ts';
import '@/ai/flows/food-scanner.ts';
import '@/ai/flows/text-chatbot.ts';
