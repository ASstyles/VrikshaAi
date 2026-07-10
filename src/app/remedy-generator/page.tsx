'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HeartPulse, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { getRemedy, GetRemedyOutput } from '@/ai/flows/remedy-generator';

const formSchema = z.object({
  ailment: z.string().min(3, 'Please describe your ailment.'),
});

export default function RemedyGeneratorPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    
    const { data: prakritiResults, isLoading: prakritiLoading } = useDoc<UserProfile>(userProfileRef);

    const [remedy, setRemedy] = useState<Omit<GetRemedyOutput, 'error'> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          ailment: '',
        },
    });
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!prakritiResults) {
            toast({
              variant: "destructive",
              title: "Prakriti not found",
              description: "Please take the Prakriti test first to get personalized remedies.",
            });
            return;
        }
        
        setIsLoading(true);
        setRemedy(null);
        
        const normalizedAilment = values.ailment.toLowerCase().trim();
        const cacheKey = `vrikshaRemedy:${prakritiResults.dominantDosha}:${normalizedAilment}`;

        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setRemedy(JSON.parse(cached));
                setIsLoading(false);
                return;
            }

            const response = await getRemedy({
                prakriti: prakritiResults.dominantDosha,
                ailment: values.ailment,
            });
            if (response.error) {
                throw new Error(response.error);
            }
            setRemedy(response);
            localStorage.setItem(cacheKey, JSON.stringify(response));
        } catch(error: any) {
            console.error("Error getting remedy", error);
            toast({
                variant: "destructive",
                title: "Failed to get remedy",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (prakritiLoading) {
        return <p>Loading your profile...</p>;
    }

    if (!prakritiResults) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-lg border shadow-sm">
                <h2 className="text-2xl font-headline font-semibold">Discover Your Wellness Path</h2>
                <p className="mt-2 text-muted-foreground max-w-md">
                    Get personalized remedies based on your unique Ayurvedic constitution.
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
                    <CardTitle>Remedy Generator</CardTitle>
                    <CardDescription>Get AI-powered Ayurvedic remedies for common ailments, personalized to your <span className="font-bold">{prakritiResults.dominantDosha}</span> constitution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="ailment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>What's your ailment?</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., headache, cough, indigestion" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                {isLoading ? 'Generating Remedy...' : 'Get Remedy'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <HeartPulse className="h-16 w-16 animate-pulse text-primary" />
                            <p>Generating your personalized remedy...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {remedy && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Personalized Remedy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <HeartPulse className="h-4 w-4" />
                            <AlertDescription>{remedy.remedy}</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
