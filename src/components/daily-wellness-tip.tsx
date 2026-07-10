'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getWellnessTips } from "@/ai/flows/wellness-tips";
import { Alert, AlertDescription } from "./ui/alert";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import type { UserProfile } from "@/lib/types";

const DAILY_TIP_STORAGE_KEY = 'vrikshaLifeDailyTip';

type CachedTip = {
    date: string;
    prakriti: string;
    tip: string;
};

export function DailyWellnessTip() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    
    const { data: prakritiResults } = useDoc<UserProfile>(userProfileRef);

    const [tip, setTip] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTip() {
            if (prakritiResults) {
                const today = new Date().toISOString().split('T')[0];

                try {
                    const cachedItem = window.localStorage.getItem(DAILY_TIP_STORAGE_KEY);
                    if (cachedItem) {
                        const cachedData: CachedTip = JSON.parse(cachedItem);
                        if (cachedData.date === today && cachedData.prakriti === prakritiResults.dominantDosha) {
                            setTip(cachedData.tip);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.warn("Could not read daily tip from cache", error);
                }


                try {
                    const month = new Date().getMonth();
                    let season = 'summer';
                    if (month >= 2 && month <= 4) season = 'spring';
                    if (month >= 8 && month <= 10) season = 'autumn';
                    if (month >= 11 || month <= 1) season = 'winter';

                    const response = await getWellnessTips({
                        prakriti: prakritiResults.dominantDosha,
                        season: season,
                        frequency: 'daily'
                    });

                    if (response.error) {
                        // Fail silently on AI errors for this non-critical feature.
                    } else if (response.tips.length > 0) {
                        const newTip = response.tips[0];
                        setTip(newTip);
                        try {
                            const newCachedTip: CachedTip = {
                                date: today,
                                prakriti: prakritiResults.dominantDosha,
                                tip: newTip
                            };
                            window.localStorage.setItem(DAILY_TIP_STORAGE_KEY, JSON.stringify(newCachedTip));
                        } catch (error) {
                            console.warn("Could not save daily tip to cache", error);
                        }
                    }
                } catch (error) {
                    // Fail silently on network or other errors.
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
        fetchTip();
    }, [prakritiResults]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Wellness Tip</CardTitle>
                <CardDescription>A personalized tip for a balanced lifestyle.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-12 w-full" />
                ) : tip ? (
                    <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription>{tip}</AlertDescription>
                    </Alert>
                ) : (
                    <p className="text-sm text-muted-foreground">No tip available for today. Check back tomorrow!</p>
                )}
                <Button asChild variant="link" className="px-0 mt-2">
                    <Link href="/wellness-tips">
                        Get more wellness tips <ArrowRight className="ml-1" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
