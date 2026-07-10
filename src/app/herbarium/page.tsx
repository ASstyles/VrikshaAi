'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Plant } from "@/lib/types";
import { SeedDatabase } from "@/components/seed-database";
import { FavoriteButton } from "@/components/favorite-button";
import { AddToGardenButton } from "@/components/add-to-garden-button";

export default function HerbariumPage() {
  const firestore = useFirestore();

  const plantsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "plants"), orderBy("name"), limit(20));
  }, [firestore]);

  const { data: plants, isLoading } = useCollection<Plant>(plantsQuery);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Digital Herbarium</CardTitle>
          <CardDescription>Explore our database of common Indian medicinal plants.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="w-full aspect-video rounded-t-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
        {plants?.map((plant) => (
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
        {!isLoading && plants?.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center text-center p-12">
              <Leaf className="h-12 w-12 text-muted-foreground mb-4"/>
              <h3 className="text-xl font-semibold">No Plants in the Herbarium</h3>
              <div className="mt-4">
                <SeedDatabase />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
