'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useFirebase, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  plantId: string;
}

export function FavoriteButton({ plantId }: FavoriteButtonProps) {
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (userProfile?.favoritePlantIds) {
      setIsFavorite(userProfile.favoritePlantIds.includes(plantId));
    } else {
        setIsFavorite(false);
    }
  }, [userProfile, plantId]);

  const toggleFavorite = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to favorite plants.',
      });
      return;
    }
    if (!userProfileRef) return;

    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite); // Optimistic update

    try {
      await updateDoc(userProfileRef, {
        favoritePlantIds: newIsFavorite
          ? arrayUnion(plantId)
          : arrayRemove(plantId),
      });
      toast({
        title: newIsFavorite ? 'Added to Favorites' : 'Removed from Favorites',
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      setIsFavorite(!newIsFavorite); // Revert on error
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update your favorites. Please try again.',
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
      onClick={toggleFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={cn(
          'h-5 w-5 transition-colors',
          isFavorite
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}
