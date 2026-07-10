'use client';
import { Auth, signOut } from 'firebase/auth';

export async function handleSignOut(auth: Auth) {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out: ", error);
    // Optionally, show a toast or notification to the user
  }
}
