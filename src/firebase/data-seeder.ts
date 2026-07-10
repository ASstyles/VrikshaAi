'use client';
import { collection, writeBatch, getDocs, doc, Firestore } from 'firebase/firestore';
import { PLANT_DATA } from '@/lib/plant-data';

export async function seedPlantData(db: Firestore) {
  const plantsCollection = collection(db, 'plants');
  
  // Use a query with limit 1 to check for existence, which is more efficient
  const checkSnapshot = await getDocs(plantsCollection);
  
  if (checkSnapshot.empty) {
    console.log('Plants collection is empty. Seeding data...');
    try {
      const batch = writeBatch(db);
      PLANT_DATA.forEach((plant) => {
        // Use the predefined plant ID for the document ID
        const plantDocRef = doc(db, 'plants', plant.id);
        batch.set(plantDocRef, plant);
      });
      await batch.commit();
      console.log('Successfully seeded plants collection.');
    } catch (error) {
      console.error('Error seeding plants collection: ', error);
    }
  } else {
    console.log('Plants collection already contains data. Seeding skipped.');
  }
}
