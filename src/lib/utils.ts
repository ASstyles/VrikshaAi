import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAiErrorMessage(error: any): string {
    if (!error) {
        return "An unknown AI error occurred.";
    }
    
    // Log the full error to the server console for debugging.
    console.error("Genkit AI Error:", error);

    const message = error.message || String(error);
    const lowMessage = message.toLowerCase();

    // 503 Service Unavailable
    if (lowMessage.includes('503') || lowMessage.includes('service unavailable') || lowMessage.includes('high demand')) {
        return "The AI service is currently overloaded due to high demand. This is a temporary spike on Google's end. Please wait 5-10 seconds and try again.";
    }

    // 429 Too Many Requests / Quota
    if (lowMessage.includes('429') || lowMessage.includes('too many requests') || lowMessage.includes('quota exceeded')) {
        return "AI rate limit exceeded. You've sent too many requests in a short period. Please wait a moment and try again.";
    }

    // Auth / API Key issues
    if (lowMessage.includes('api key expired') || lowMessage.includes('api_key_invalid') || lowMessage.includes('403') || lowMessage.includes('400') || lowMessage.includes('unauthorized')) {
        return "AI Authentication failed. Please ensure you have a valid Gemini API key from Google AI Studio (https://aistudio.google.com/) set in your .env file.";
    }

    // Safety filters
    if (lowMessage.includes('safety') || lowMessage.includes('blocked')) {
        return "The AI request was blocked by safety filters. Please try a different query.";
    }
    
    return `AI Error: ${message}`;
}
