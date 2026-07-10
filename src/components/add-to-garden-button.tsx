'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';
import { useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddToGardenButtonProps {
  plantId: string;
}

export function AddToGardenButton({ plantId }: AddToGardenButtonProps) {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const [isInGarden, setIsInGarden] = useState(false);

  useEffect(() => {
    if (userProfile?.gardenPlantIds) {
      setIsInGarden(userProfile.gardenPlantIds.includes(plantId));
    } else {
        setIsInGarden(false);
    }
  }, [userProfile, plantId]);

  const toggleInGarden = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to manage your garden.',
      });
      return;
    }
    if (!userProfileRef) return;

    const newIsInGarden = !isInGarden;
    setIsInGarden(newIsInGarden); // Optimistic update

    try {
      await updateDoc(userProfileRef, {
        gardenPlantIds: newIsInGarden
          ? arrayUnion(plantId)
          : arrayRemove(plantId),
      });
      toast({
        title: newIsInGarden ? 'Added to Garden' : 'Removed from Garden',
      });
    } catch (error) {
      console.error('Error updating garden plan:', error);
      setIsInGarden(!newIsInGarden); // Revert on error
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update your garden plan. Please try again.',
      });
    }
  };

  if (isUserLoading || !user) {
    return null; // Don't show the button if user state is loading or not logged in
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleInGarden}
      aria-label={isInGarden ? 'Remove from garden plan' : 'Add to garden plan'}
    >
      <Sprout
        className={cn(
          'h-5 w-5 transition-colors',
          isInGarden
            ? 'fill-green-500 text-green-500'
            : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}
