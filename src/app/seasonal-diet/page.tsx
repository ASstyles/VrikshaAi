'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { getSeasonalDietGuide, SeasonalDietGuideOutput } from '@/ai/flows/seasonal-diet-guide';
import { Utensils, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';

export default function SeasonalDietPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    
  const { data: prakritiResults, isLoading: prakritiLoading } = useDoc<UserProfile>(userProfileRef);

  const [season, setSeason] = useState('summer');
  const [guide, setGuide] = useState<Omit<SeasonalDietGuideOutput, 'error'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetGuide = async () => {
    if (!prakritiResults) {
      toast({
        variant: "destructive",
        title: "Prakriti not found",
        description: "Please take the Prakriti test first to get a personalized guide.",
      });
      return;
    }
    
    setIsLoading(true);
    setGuide(null);
    
    const cacheKey = `vrikshaSeasonalDiet:${prakritiResults.dominantDosha}:${season}`;

    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setGuide(JSON.parse(cached));
            setIsLoading(false);
            return;
        }

        const response = await getSeasonalDietGuide({
            prakriti: prakritiResults.dominantDosha,
            season,
        });
        if (response.error) {
            throw new Error(response.error);
        }
        setGuide(response);
        localStorage.setItem(cacheKey, JSON.stringify(response));
    } catch(error: any) {
        console.error("Error getting diet guide", error);
        toast({
            variant: "destructive",
            title: "Failed to get guide",
            description: error.message,
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
            <h2 className="text-2xl font-headline font-semibold">Unlock Your Personalized Diet</h2>
            <p className="mt-2 text-muted-foreground max-w-md">
                Get seasonal dietary recommendations based on your unique Ayurvedic constitution.
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
          <CardTitle>Seasonal Diet Guide</CardTitle>
          <CardDescription>Select a season to get dietary recommendations tailored for your <span className="font-bold">{prakritiResults.dominantDosha}</span> constitution.</CardDescription>
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
            <Button onClick={handleGetGuide} disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Generating Guide...' : 'Get Diet Guide'}
            </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Utensils className="h-16 w-16 animate-pulse text-primary" />
                    <p>Generating your personalized diet guide...</p>
                </div>
            </CardContent>
        </Card>
      )}
      
      {guide && (
        <Card>
            <CardHeader>
                <CardTitle className="capitalize">Diet for {season}</CardTitle>
                <CardDescription>{guide.introduction}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-primary">
                        <CheckCircle className="h-5 w-5" />
                        Foods to Favor
                    </h3>
                    <ul className="space-y-2">
                        {guide.foodsToFavor.map((food, index) => (
                            <li key={index} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                                <span className="text-sm">{food}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-destructive">
                        <XCircle className="h-5 w-5" />
                        Foods to Avoid
                    </h3>
                    <ul className="space-y-2">
                        {guide.foodsToAvoid.map((food, index) => (
                            <li key={index} className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                                <span className="text-sm">{food}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
