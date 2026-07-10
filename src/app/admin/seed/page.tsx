'use client';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PLANT_DATA } from "@/lib/plant-data";
import { useFirestore } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
import { useState } from "react";

export default function SeedPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleSeed = async () => {
        if (!firestore) {
            toast({
                variant: 'destructive',
                title: 'Firestore not available',
            });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const batch = writeBatch(firestore);
            const plantsCollection = collection(firestore, 'plants');
            
            PLANT_DATA.forEach(plant => {
                const { id, ...plantData } = plant;
                const docRef = doc(plantsCollection, id);
                batch.set(docRef, plantData);
            });

            await batch.commit();

            toast({
                title: "Database Seeded!",
                description: `${PLANT_DATA.length} plants have been added to the herbarium.`
            });

        } catch (error: any) {
            console.error("Error seeding database:", error);
            toast({
                variant: 'destructive',
                title: "Seeding Failed",
                description: error.message || "An error occurred while seeding the database."
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container mx-auto mt-10 text-center">
            <h1 className="text-2xl font-bold mb-4">Seed Firestore Database</h1>
            <p className="mb-6">Click the button below to populate the 'plants' collection with initial data.</p>
            <Button onClick={handleSeed} disabled={isLoading}>
                {isLoading ? "Seeding..." : "Seed Plant Data"}
            </Button>
        </div>
    )
}
