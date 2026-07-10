'use client';
import { useState, useRef, useEffect } from 'react';
import { voiceChatbot, VoiceChatbotInput } from '@/ai/flows/voice-chatbot';
import { Bot, User, Mic, MicOff, Volume2, Sparkles, Send, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'model';
  content: string;
  audioUrl?: string;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Hello! I am AyurBot Voice. Tap the microphone to ask me your Ayurvedic questions verbally, and I will answer and speak back to you.',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN'; // set to Indian English or fallback

        rec.onstart = () => {
          setIsListening(true);
          setIsSpeaking(false);
          if (audioRef.current) {
            audioRef.current.pause();
          }
        };

        rec.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            await handleVoiceSubmit(transcript);
          }
        };

        rec.onerror = (event: any) => {
          setIsListening(false);

          if (event.error === 'no-speech' || event.error === 'aborted') {
            console.warn(`Speech recognition stopped: ${event.error}`);
            return;
          }

          console.error('Speech recognition error:', event.error);

          let errorMessage = `Speech recognition failed: '${event.error}'`;
          if (event.error === 'not-allowed') {
            errorMessage = 'Microphone access blocked. Please check your browser permissions.';
          }

          toast({
            variant: 'destructive',
            title: 'Voice Error',
            description: errorMessage,
          });
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser. Please try Chrome or Safari.',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const handleVoiceSubmit = async (transcript: string) => {
    const newMessages = [...messages, { role: 'user', content: transcript } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const flowHistory = newMessages.slice(1, -1).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const chatInput: VoiceChatbotInput = {
        message: transcript,
        history: flowHistory,
      };

      const result = await voiceChatbot(chatInput);

      if (result.error) {
        throw new Error(result.error);
      }

      const botMessage: Message = {
        role: 'model',
        content: result.response || 'I apologize, but I could not formulate a response.',
        audioUrl: result.audio,
      };

      setMessages(prev => [...prev, botMessage]);

      if (result.audio) {
        playAudioResponse(result.audio);
      }
    } catch (error: any) {
      console.error('Error with voice chatbot:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to communicate with AyurBot Voice.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioResponse = (audioDataUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioDataUrl);
    audioRef.current = audio;

    audio.onplay = () => {
      setIsSpeaking(true);
    };

    audio.onended = () => {
      setIsSpeaking(false);
    };

    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      setIsSpeaking(false);
      toast({
        variant: 'destructive',
        title: 'Playback Error',
        description: 'Failed to play back the audio response.',
      });
    };

    audio.play().catch(err => {
      console.error('Failed to auto-play audio:', err);
      setIsSpeaking(false);
    });
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  const Waveform = ({ activeColor }: { activeColor: string }) => (
    <div className="flex items-center gap-1 h-6">
      <div className={`w-1 h-4 rounded-full ${activeColor} animate-bounce`} style={{ animationDelay: '0.1s' }} />
      <div className={`w-1 h-6 rounded-full ${activeColor} animate-bounce`} style={{ animationDelay: '0.2s' }} />
      <div className={`w-1 h-3 rounded-full ${activeColor} animate-bounce`} style={{ animationDelay: '0.3s' }} />
      <div className={`w-1 h-5 rounded-full ${activeColor} animate-bounce`} style={{ animationDelay: '0.4s' }} />
      <div className={`w-1 h-2 rounded-full ${activeColor} animate-bounce`} style={{ animationDelay: '0.5s' }} />
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4">
      <Card className="flex flex-col flex-1 overflow-hidden shadow-md border-emerald-100/50 dark:border-emerald-950/20 bg-gradient-to-b from-white to-emerald-50/10 dark:from-slate-950 dark:to-emerald-950/5">
        <CardHeader className="border-b border-slate-100 dark:border-slate-900 pb-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Mic size={24} className={isListening ? 'animate-pulse' : ''} />
            </div>
            <div>
              <CardTitle className="font-headline text-xl text-emerald-800 dark:text-emerald-300">AyurBot Voice</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-emerald-400/80">
                Your voice-enabled Ayurvedic wellness assistant.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isListening && <Waveform activeColor="bg-rose-500" />}
            {isSpeaking && <Waveform activeColor="bg-emerald-500" />}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full p-4 pr-6">
            <div className="space-y-4 pb-4">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/10 p-3.5 rounded-lg text-sm text-emerald-800 dark:text-emerald-300/90 leading-relaxed shadow-sm">
                <div className="flex gap-2 items-start">
                  <Sparkles size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                  <p>
                    Tap the microphone and ask *anything*—from remedies to herb identification questions. AyurBot will answer you, and read the response back to you automatically!
                  </p>
                </div>
              </div>

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role !== 'user' && (
                    <Avatar className="h-8 w-8 border border-emerald-100 dark:border-emerald-900 bg-white">
                      <AvatarFallback className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                        <Bot size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm relative ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap pr-6">{msg.content}</p>
                    {msg.role !== 'user' && msg.audioUrl && (
                      <button
                        onClick={() => playAudioResponse(msg.audioUrl!)}
                        className="absolute right-2 bottom-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        title="Replay Audio"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <Avatar className="h-8 w-8 border border-emerald-100 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
                      <AvatarFallback className="text-emerald-700 dark:text-emerald-300 bg-transparent">
                        <User size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-end gap-2.5 justify-start">
                  <Avatar className="h-8 w-8 border border-emerald-100 dark:border-emerald-900 bg-white">
                    <AvatarFallback className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                      <Bot size={16} className="animate-bounce" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-900 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce delay-150"></span>
                      <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-8 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleListening}
              size="lg"
              className={`h-16 w-16 rounded-full shadow-lg ${
                isListening
                  ? 'bg-rose-500 hover:bg-rose-600 animate-pulse text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              disabled={isLoading}
            >
              {isListening ? <MicOff size={28} /> : <Mic size={28} />}
            </Button>

            {isSpeaking && (
              <Button
                onClick={stopSpeaking}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500"
              >
                <VolumeX size={18} />
              </Button>
            )}
          </div>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {isListening
              ? 'Listening to you... Tap again to stop.'
              : isSpeaking
              ? 'Speaking response... Tap microphone to interrupt.'
              : isLoading
              ? 'Formulating response...'
              : 'Tap the microphone to speak.'}
          </p>
        </div>
      </Card>
    </div>
  );
}
