
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config.js'; // Use .js extension for node esm
import { PLANT_DATA } from '../src/lib/plant-data.js'; // Use .js extension

// DO NOT use top-level await
async function seed() {
    console.log('Seeding Firestore database...');

    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    const db = getFirestore(firebaseApp);

    // Get a new write batch
    const batch = writeBatch(db);

    // Set the data for each plant
    const plantsCollection = collection(db, 'plants');
    PLANT_DATA.forEach((plant) => {
        const docRef = doc(db, 'plants', plant.id);
        batch.set(docRef, plant);
    });

    try {
        // Commit the batch
        await batch.commit();
        console.log('Successfully seeded plants collection!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
    // process.exit() is not needed in modern node scripts, it will exit naturally.
}

seed();
