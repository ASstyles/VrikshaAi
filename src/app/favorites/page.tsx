'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirebase, useUser, useDoc, useMemoFirebase } from "@/firebase";
import type { UserProfile, Plant } from "@/lib/types";
import { doc, collection, getDocs, query, where, documentId } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/favorite-button";
import { AddToGardenButton } from "@/components/add-to-garden-button";

const PlantCardSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="w-full aspect-video rounded-t-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );

export default function FavoritesPage() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const [favoritePlants, setFavoritePlants] = useState<Plant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (userProfile?.favoritePlantIds && userProfile.favoritePlantIds.length > 0 && firestore) {
                setIsLoading(true);
                try {
                    const plantsRef = collection(firestore, 'plants');
                    // Firestore 'in' query is limited to 30 items in this version. For more, multiple queries would be needed.
                    const q = query(plantsRef, where(documentId(), 'in', userProfile.favoritePlantIds.slice(0, 30)));
                    const querySnapshot = await getDocs(q);
                    const plants = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Plant));
                    setFavoritePlants(plants);
                } catch (error) {
                    console.error("Error fetching favorite plants:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setFavoritePlants([]);
                setIsLoading(false);
            }
        };

        if (!isProfileLoading) {
            fetchFavorites();
        }

    }, [userProfile, isProfileLoading, firestore]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Favorite Plants</CardTitle>
                    <CardDescription>Your personal collection of medicinal plants.</CardDescription>
                </CardHeader>
            </Card>

            {(isLoading || isProfileLoading) && (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => <PlantCardSkeleton key={i} />)}
                </div>
            )}
            
            {!isLoading && !isProfileLoading && favoritePlants.length === 0 && (
                <Alert>
                    <Star className="h-4 w-4" />
                    <AlertTitle>No Favorites Yet!</AlertTitle>
                    <AlertDescription>
                        You haven't added any plants to your favorites. Explore the{' '}
                        <Link href="/herbarium" className="font-semibold underline">Herbarium</Link> to find plants you love.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favoritePlants.map((plant) => (
                    <Card key={plant.id} className="flex flex-col">
                        <CardHeader>
                        <div className="relative aspect-video w-full">
                            <Image
                            src={plant.image.url}
                            alt={plant.image.alt}
                            fill
                            className="rounded-t-lg object-cover"
                            data-ai-hint={plant.image.hint}
                            />
                            <div className="absolute top-2 right-2 flex items-center bg-background/70 rounded-full">
                                <AddToGardenButton plantId={plant.id} />
                                <FavoriteButton plantId={plant.id} />
                            </div>
                        </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <h3 className="text-xl font-headline font-semibold">{plant.name}</h3>
                        <p className="text-sm italic text-muted-foreground">{plant.scientificName}</p>
                        <p className="mt-2 text-sm text-foreground/80 line-clamp-3">{plant.description}</p>
                        </CardContent>
                        <CardContent>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/herbarium/${plant.id}`}>
                            Learn More <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
