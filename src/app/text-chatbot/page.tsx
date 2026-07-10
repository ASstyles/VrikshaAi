'use client';
import { useState, useRef, useEffect } from 'react';
import { textChatbot, TextChatbotInput } from '@/ai/flows/text-chatbot';
import { Bot, User, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function TextChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'Greetings! I am AyurBot Sage. Ask me anything about Ayurvedic principles, medicinal plants, remedies, or how to balance your doshas.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Map history to the format expected by the Genkit flow
      const flowHistory = newMessages.slice(1, -1).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const chatInput: TextChatbotInput = {
        message: userMessage,
        history: flowHistory,
      };

      const result = await textChatbot(chatInput);

      if (result.error) {
        throw new Error(result.error);
      }

      setMessages(prev => [
        ...prev,
        { role: 'model', content: result.response || 'I apologize, but I could not formulate a response.' },
      ]);
    } catch (error: any) {
      console.error('Error with text chatbot:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get a response from AyurBot.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4">
      <Card className="flex flex-col flex-1 overflow-hidden shadow-md border-emerald-100/50 dark:border-emerald-950/20 bg-gradient-to-b from-white to-emerald-50/10 dark:from-slate-950 dark:to-emerald-950/5">
        <CardHeader className="border-b border-slate-100 dark:border-slate-900 pb-4 flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Bot size={24} className="animate-pulse" />
          </div>
          <div>
            <CardTitle className="font-headline text-xl text-emerald-800 dark:text-emerald-300">AyurBot Sage</CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-emerald-400/80">
              Your Ayurvedic guide powered by artificial intelligence.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0 relative">
          <ScrollArea className="h-full p-4 pr-6">
            <div className="space-y-4 pb-4">
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/30 dark:border-emerald-900/10 p-3.5 rounded-lg text-sm text-emerald-800 dark:text-emerald-300/90 leading-relaxed shadow-sm">
                <div className="flex gap-2 items-start">
                  <Sparkles size={16} className="mt-0.5 text-emerald-600 shrink-0" />
                  <p>
                    Ask *anything*—from remedies for common symptoms, dietary choices for your constitution, to details about herbs. AyurBot translates your queries into customized Ayurvedic insights.
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
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
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

        <div className="p-4 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask AyurBot Sage..."
              className="flex-1 border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-slate-800"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
