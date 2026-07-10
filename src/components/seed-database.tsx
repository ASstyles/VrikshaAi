'use client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { PLANT_DATA } from '@/lib/plant-data';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Sprout } from 'lucide-react';

export function SeedDatabase() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const plantsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "plants");
  }, [firestore]);

  const { data: plants, isLoading } = useCollection(plantsRef);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSeed = async () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore not available.' });
      return;
    }
    setIsSeeding(true);

    try {
      const batch = writeBatch(firestore);
      PLANT_DATA.forEach((plant) => {
        const { id, ...plantData } = plant;
        const plantDoc = doc(firestore, 'plants', id);
        batch.set(plantDoc, plantData);
      });

      await batch.commit();

      toast({
        title: 'Database Seeded!',
        description: `${PLANT_DATA.length} plants have been added to the herbarium.`,
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: 'Could not seed the database. Check console for errors.',
      });
    } finally {
      setIsSeeding(false);
    }
  };
  
    // Don't render this on the server
  if (!isClient) {
    return null;
  }

  if (isLoading || (plants && plants.length > 0)) {
    return null; // Don't show if loading or if plants already exist
  }

  return (
    <div>
        <p className="text-sm text-muted-foreground mb-2">Your herbarium is empty. Click here to add the sample plants.</p>
        <Button onClick={handleSeed} disabled={isSeeding}>
            <Sprout className="mr-2" />
            {isSeeding ? 'Seeding Database...' : 'Seed Herbarium Data'}
        </Button>
    </div>
  );
}
