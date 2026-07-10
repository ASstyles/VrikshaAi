'use client';

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Plant } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import { AddToGardenButton } from "@/components/add-to-garden-button";

export default function PlantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const firestore = useFirestore();

  const plantRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "plants", slug);
  }, [firestore, slug]);

  const { data: plant, isLoading } = useDoc<Plant>(plantRef);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="w-full aspect-[16/9] mb-6"/>
                <Skeleton className="h-10 w-3/4 mb-2"/>
                <Skeleton className="h-6 w-1/2"/>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Skeleton className="h-6 w-1/4 mb-2"/>
                    <Skeleton className="h-20 w-full"/>
                </div>
                <div>
                    <Skeleton className="h-6 w-1/4 mb-2"/>
                    <Skeleton className="h-20 w-full"/>
                </div>
            </CardContent>
        </Card>
    )
  }

  if (!plant) {
    return (
        <Card className="flex items-center justify-center p-8 min-h-[400px]">
             <Alert variant="destructive" className="max-w-md text-center">
                <Leaf className="h-6 w-6 mx-auto mb-2" />
                <AlertTitle className="text-xl font-headline">Plant Not Found</AlertTitle>
                <AlertDescription>
                    The plant you are looking for could not be found in our herbarium. It may have been moved or does not exist.
                </AlertDescription>
                <Button asChild variant="outline" className="mt-4">
                    <Link href="/herbarium">Return to Herbarium</Link>
                </Button>
            </Alert>
        </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <div className="relative aspect-[16/9] w-full mb-6">
                <Image
                  src={plant.image.url}
                  alt={plant.image.alt}
                  fill
                  className="rounded-lg object-cover"
                  data-ai-hint={plant.image.hint}
                />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-3xl md:text-4xl">{plant.name}</CardTitle>
                <CardDescription className="text-md md:text-lg italic">{plant.scientificName}</CardDescription>
              </div>
              <div className="flex">
                <AddToGardenButton plantId={slug} />
                <FavoriteButton plantId={slug} />
              </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-xl mb-2">Description</h3>
                <p className="text-foreground/80">{plant.description}</p>
            </div>
            <div>
                <h3 className="font-semibold text-xl mb-2">Key Uses</h3>
                <p className="text-foreground/80">{plant.uses}</p>
            </div>
        </CardContent>
    </Card>
  );
}
