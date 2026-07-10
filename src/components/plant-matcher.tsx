'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePrakriti } from '@/hooks/use-prakriti';
import { plantRecommendation, PlantRecommendationOutput } from '@/ai/flows/plant-recommendation';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Plant } from '@/lib/types';
import { collection } from 'firebase/firestore';


const formSchema = z.object({
  healthConcerns: z.string().min(3, 'Please describe your health concerns.'),
  season: z.string(),
  availability: z.string().min(3, 'e.g. "North India", "local grocery"'),
});

export function PlantMatcher() {
  const { results: prakritiResults } = usePrakriti();
  const [recommendations, setRecommendations] = useState<Omit<PlantRecommendationOutput, 'error'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const firestore = useFirestore();
  const plantsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "plants");
  }, [firestore]);
  const { data: plants } = useCollection<Plant>(plantsQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      healthConcerns: '',
      season: 'summer',
      availability: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!prakritiResults) {
      toast({
        variant: "destructive",
        title: "Prakriti profile not found",
        description: "Please complete the Prakriti test before getting recommendations.",
      });
      return;
    }
    
    setIsLoading(true);
    setRecommendations(null);

    try {
        const sortedDoshas = Object.entries({
          vata: prakritiResults.vata,
          pitta: prakritiResults.pitta,
          kapha: prakritiResults.kapha
        }).sort(([, a], [, b]) => b - a);
        
        const dominantDosha = sortedDoshas[0][0];

        const response = await plantRecommendation({
            prakriti: prakritiResults.constitution,
            dominantDosha,
            healthConcerns: values.healthConcerns,
            season: values.season,
            availability: values.availability
        });
        
        if (response.error) {
            throw new Error(response.error);
        }
        setRecommendations(response);
    } catch (error: any) {
        console.error("Error getting plant recommendations:", error);
        toast({
            variant: "destructive",
            title: "Recommendation Failed",
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plant Matcher</CardTitle>
        <CardDescription>AI-powered plant recommendations based on your profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="healthConcerns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Health Concerns</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., stress, indigestion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="season"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Season</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a season" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="spring">Spring</SelectItem>
                                    <SelectItem value="summer">Summer</SelectItem>
                                    <SelectItem value="autumn">Autumn</SelectItem>
                                    <SelectItem value="winter">Winter</SelectItem>
                                </SelectContent>
                            </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plant Availability</FormLabel>
                          <FormControl>
                            <Input placeholder="Where are you located?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? 'Finding Plants...' : 'Get Recommendations'}
                    </Button>
                </form>
            </Form>

            <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-6">
                {isLoading && (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <Leaf className="h-12 w-12 animate-spin text-primary" />
                        <p>Finding the best plants for you...</p>
                    </div>
                )}
                {recommendations && (
                    <div className="w-full">
                        <h4 className="font-headline text-lg font-semibold mb-4">Your Recommended Plants:</h4>
                        <ul className="space-y-3">
                            {recommendations.recommendations.map((plantName, index) => {
                                const slug = plantName.toLowerCase().replace(/ \(.+\)/, '').replace(/ /g, '-');
                                const plantExists = plants?.some(p => p.id === slug);

                                return (
                                    <li key={index} className="bg-background p-3 rounded-md border flex items-center gap-3">
                                        <Leaf className="h-5 w-5 text-primary" />
                                        {plantExists ? (
                                            <Link href={`/herbarium/${slug}`} className="font-medium hover:text-primary transition-colors">
                                                {plantName}
                                            </Link>
                                        ) : (
                                            <span className="font-medium">{plantName}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
                {!isLoading && !recommendations && (
                     <div className="text-center text-muted-foreground">
                        <p>Your plant recommendations will appear here.</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
