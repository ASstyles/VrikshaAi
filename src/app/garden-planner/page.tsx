'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirebase, useUser, useDoc, useMemoFirebase } from "@/firebase";
import type { UserProfile, Plant } from "@/lib/types";
import { doc, collection, getDocs, query, where, documentId } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Sprout, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToGardenButton } from "@/components/add-to-garden-button";
import { FavoriteButton } from "@/components/favorite-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getPlantingInstructions, PlantingInstructionsOutput } from "@/ai/flows/planting-instructions";
import { useToast } from "@/hooks/use-toast";


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

const PlantingInstructions = ({ plantName }: { plantName: string }) => {
  const [instructions, setInstructions] = useState<Omit<PlantingInstructionsOutput, 'error'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchInstructions = async () => {
    // Only fetch if not already fetched
    if (instructions || isLoading) return;

    setIsLoading(true);
    try {
      const result = await getPlantingInstructions({ plantName });
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      } else {
        setInstructions(result);
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch planting instructions.",
        });
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <Accordion type="single" collapsible className="w-full" onValueChange={(value) => setIsOpen(!!value)}>
          <AccordionItem value="item-1">
              <AccordionTrigger onClick={fetchInstructions} disabled={isLoading}>
                  Planting & Care Guide
              </AccordionTrigger>
              <AccordionContent>
                  {isLoading && <p className="text-sm text-muted-foreground">Loading instructions...</p>}
                  {!isLoading && instructions && (
                      <div className="space-y-4 text-sm">
                          <div>
                              <h4 className="font-semibold mb-1">Planting</h4>
                              <p className="text-muted-foreground">{instructions.planting}</p>
                          </div>
                          <div>
                              <h4 className="font-semibold mb-1">Care</h4>
                              <p className="text-muted-foreground">{instructions.care}</p>
                          </div>
                      </div>
                  )}
                  {!isLoading && !instructions && isOpen && (
                    <p className="text-sm text-muted-foreground">Could not load instructions.</p>
                  )}
              </AccordionContent>
          </AccordionItem>
      </Accordion>
  )
}

export default function GardenPlannerPage() {
    const { firestore } = useFirebase();
    const { user } = useUser();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const [gardenPlants, setGardenPlants] = useState<Plant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGardenPlants = async () => {
            if (userProfile?.gardenPlantIds && userProfile.gardenPlantIds.length > 0 && firestore) {
                setIsLoading(true);
                try {
                    const plantsRef = collection(firestore, 'plants');
                    const q = query(plantsRef, where(documentId(), 'in', userProfile.gardenPlantIds.slice(0, 30)));
                    const querySnapshot = await getDocs(q);
                    const plants = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Plant));
                    setGardenPlants(plants);
                } catch (error) {
                    console.error("Error fetching garden plants:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setGardenPlants([]);
                setIsLoading(false);
            }
        };

        if (!isProfileLoading) {
            fetchGardenPlants();
        }

    }, [userProfile, isProfileLoading, firestore]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Garden Planner</CardTitle>
                    <CardDescription>Your personal space to plan and learn about your Ayurvedic garden.</CardDescription>
                </CardHeader>
            </Card>

            {(isLoading || isProfileLoading) && (
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => <PlantCardSkeleton key={i} />)}
                </div>
            )}
            
            {!isLoading && !isProfileLoading && gardenPlants.length === 0 && (
                <Alert>
                    <Sprout className="h-4 w-4" />
                    <AlertTitle>Your Garden is Empty!</AlertTitle>
                    <AlertDescription>
                        You haven't added any plants to your garden plan. Explore the{' '}
                        <Link href="/herbarium" className="font-semibold underline">Herbarium</Link> to start planning.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {gardenPlants.map((plant) => (
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
                        <CardContent className="flex-grow space-y-2">
                            <div>
                                <h3 className="text-xl font-headline font-semibold">{plant.name}</h3>
                                <p className="text-sm italic text-muted-foreground">{plant.scientificName}</p>
                            </div>
                            <p className="text-sm text-foreground/80 line-clamp-3">{plant.description}</p>
                        </CardContent>
                        <CardContent className="flex flex-col gap-4">
                            <PlantingInstructions plantName={plant.name} />
                            <Button asChild variant="outline" className="w-full">
                                <Link href={`/herbarium/${plant.id}`}>
                                    View Full Details <ArrowRight className="ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
