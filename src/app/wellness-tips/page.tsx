'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { getWellnessTips, WellnessTipsOutput } from '@/ai/flows/wellness-tips';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';

export default function WellnessTipsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    
  const { data: prakritiResults, isLoading: prakritiLoading } = useDoc<UserProfile>(userProfileRef);

  const [season, setSeason] = useState('summer');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [tips, setTips] = useState<Omit<WellnessTipsOutput, 'error'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetTips = async () => {
    if (!prakritiResults) {
      toast({
        variant: "destructive",
        title: "Prakriti not found",
        description: "Please take the Prakriti test first to get personalized tips.",
      });
      return;
    }
    
    setIsLoading(true);
    setTips(null);
    
    try {
        const response = await getWellnessTips({
            prakriti: prakritiResults.dominantDosha,
            season,
            frequency
        });
        if (response.error) {
            toast({
                variant: "destructive",
                title: "Failed to get tips",
                description: response.error,
            });
        } else {
            setTips(response);
        }
    } catch(error: any) {
        toast({
            variant: "destructive",
            title: "Failed to get tips",
            description: "An unexpected error occurred. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (prakritiLoading) {
    return <p>Loading your profile...</p>;
  }

  if (!prakritiResults) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-headline font-semibold">Discover Your Wellness Path</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
                Get personalized wellness tips based on your unique Ayurvedic constitution.
            </p>
            <Button asChild className="mt-6">
                <Link href="/prakriti-test">
                    Take the Prakriti Test <ArrowRight className="ml-2" />
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalized Wellness Tips</CardTitle>
          <CardDescription>Select a season and frequency to get tips tailored to your <span className="font-bold">{prakritiResults.dominantDosha}</span> constitution.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
            <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="autumn">Autumn</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                </SelectContent>
            </Select>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as 'daily'|'weekly')}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={handleGetTips} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Getting Tips...' : 'Get Wellness Tips'}
            </Button>
        </CardContent>
      </Card>
      
      {tips && (
        <Card>
            <CardHeader>
                <CardTitle className="capitalize">{frequency} Tips for {season}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {tips.tips.map((tip, index) => (
                        <li key={index}>
                             <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertDescription>{tip}</AlertDescription>
                            </Alert>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
