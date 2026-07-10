'use client';
import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { seedPlantData } from '@/firebase/data-seeder';

export function DataSeeder() {
    const firestore = useFirestore();
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        const runSeeder = async () => {
            if (firestore && !isSeeding) {
                // Prevent seeding from running multiple times on fast refresh
                if (sessionStorage.getItem('vrikshaai-data-seeded')) {
                    return;
                }
                setIsSeeding(true);
                sessionStorage.setItem('vrikshaai-data-seeded', 'true');
                
                try {
                    await seedPlantData(firestore);
                } catch(e) {
                    console.error("Error seeding data", e);
                    // Clear flag if seeding fails to allow retry
                    sessionStorage.removeItem('vrikshaai-data-seeded');
                } finally {
                    setIsSeeding(false);
                }
            }
        };

        runSeeder();
    }, [firestore, isSeeding]);

    return null; // This component doesn't render anything
}
