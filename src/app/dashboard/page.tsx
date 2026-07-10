'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, UserCheck } from "lucide-react";
import { PlantMatcher } from "@/components/plant-matcher";
import { DailyWellnessTip } from "@/components/daily-wellness-tip";
import { DoshaChart } from "@/components/dosha-chart";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";


export default function DashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: loading } = useDoc<UserProfile>(userProfileRef);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Loading your profile...</p>
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-lg border shadow-sm">
                <h2 className="text-2xl font-headline font-semibold">Welcome to VrikshaAi!</h2>
                <p className="mt-2 text-muted-foreground max-w-md">
                    To personalize your experience, we need to understand your unique Ayurvedic constitution.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/prakriti-test">
                        Take the Prakriti Test <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>
        );
    }
    
    const { vataScore, pittaScore, kaphaScore, dominantDosha } = userProfile;

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl sm:text-3xl">Welcome Back, {user?.displayName || 'User'}!</CardTitle>
                    <CardDescription>Here's your personalized Ayurvedic dashboard.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Your Constitution</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-headline">{dominantDosha}</div>
                        <p className="text-xs text-muted-foreground">
                            A unique blend of Vata, Pitta, and Kapha.
                        </p>
                    </CardContent>
                </Card>
                <DoshaChart vata={vataScore} pitta={pittaScore} kapha={kaphaScore} />
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Explore More</CardTitle>
                         <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Discover plants, get tips, and more.</p>
                         <Button asChild variant="outline">
                            <Link href="/herbarium">
                                Visit Herbarium
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-6">
                <PlantMatcher />
                <DailyWellnessTip />
            </div>
        </div>
    );
}
