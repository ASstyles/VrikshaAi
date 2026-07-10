'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, PrakritiResults } from '@/lib/types';


export function usePrakriti() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const [results, setResultsState] = useState<PrakritiResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLoading = isAuthLoading || isProfileLoading;
    setLoading(isLoading);
    if (!isLoading && userProfile) {
      setResultsState({
        vata: userProfile.vataScore,
        pitta: userProfile.pittaScore,
        kapha: userProfile.kaphaScore,
        constitution: userProfile.dominantDosha,
      });
    } else if (!isLoading && !userProfile) {
        setResultsState(null);
    }
  }, [userProfile, isAuthLoading, isProfileLoading]);


  const setResults = useCallback((newResults: PrakritiResults) => {
    // This now primarily updates the local state, while persistence is handled in the test component.
    setResultsState(newResults);
  }, []);
  
  const clearResults = useCallback(() => {
    // In a full auth system, this might not be needed, but good for testing.
    setResultsState(null);
  }, []);


  return { results, setResults, loading, clearResults };
}
