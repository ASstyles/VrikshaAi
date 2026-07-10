'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { analyzeFoodFromPhoto, FoodScannerOutput } from '@/ai/flows/food-scanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Utensils, Upload, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function FoodScannerPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: prakritiResults, isLoading: prakritiLoading } = useDoc<UserProfile>(userProfileRef);

  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Omit<FoodScannerOutput, 'error'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 100MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleIdentify() {
    if (!preview) {
        toast({
            variant: "destructive",
            title: "No photo uploaded",
            description: "Please upload a photo of your meal to analyze.",
        });
        return;
    }

    if (!prakritiResults) {
        toast({
            variant: "destructive",
            title: "Prakriti profile not found",
            description: "We need your Prakriti to give personalized advice. Please take the test first.",
        });
        return;
    }
    
    setIsLoading(true);
    setResult(null);

    try {
      const input = {
          photoDataUri: preview,
          prakriti: prakritiResults.dominantDosha,
      };

      const response = await analyzeFoodFromPhoto(input);
      if (response.error) {
        throw new Error(response.error);
      }
      setResult(response);
    } catch (error: any) {
      console.error('Error analyzing food:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (prakritiLoading || isUserLoading) {
      return <p>Loading your profile...</p>
  }

  if (!prakritiResults) {
      return (
            <div className="flex flex-col items-center justify-center h-full text-center bg-card p-8 rounded-lg border shadow-sm">
                <h2 className="text-2xl font-headline font-semibold">Analyze Your Meals</h2>
                <p className="mt-2 text-muted-foreground max-w-md">
                    To get personalized dietary advice, we first need to know your Ayurvedic constitution.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/prakriti-test">
                        Take the Prakriti Test <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ayurvedic Food Scanner</CardTitle>
        <CardDescription>Upload a photo of your meal for personalized dietary advice based on your <span className="font-bold">{prakritiResults.dominantDosha}</span> constitution.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="photo-upload">Meal Photo</Label>
                <div className="relative w-full aspect-video border-2 border-dashed rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {preview ? (
                        <Image src={preview} alt="Meal preview" fill className="object-cover" />
                    ) : (
                        <div className="text-center text-muted-foreground p-4">
                            <Upload className="mx-auto h-10 w-10 mb-2"/>
                            <p className="font-semibold">Click to upload or drag and drop</p>
                            <p className="text-xs">PNG, JPG, or JPEG (Max 100MB)</p>
                        </div>
                    )}
                     <Input
                        id="photo-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <Button onClick={handleIdentify} disabled={isLoading || !preview} className="w-full">
                {isLoading ? 'Analyzing Meal...' : 'Get Diet Advice'}
            </Button>
        </div>
        <div className="flex items-center justify-center">
            {isLoading && (
                 <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Utensils className="h-16 w-16 animate-spin text-primary" />
                    <p>Analyzing your meal...</p>
                </div>
            )}
            {result && (
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Analysis Result
                            <Badge variant={result.isHealthy ? "default" : "destructive"}>
                                {result.isHealthy ? (
                                    <><CheckCircle className="mr-1 h-3 w-3" /> Suitable</>
                                ) : (
                                    <><XCircle className="mr-1 h-3 w-3" /> Less Suitable</>
                                )}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Identified Foods:</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.foodItems.map(item => <Badge key={item} variant="secondary">{item}</Badge>)}
                            </div>
                        </div>
                        <Alert>
                            <AlertTitle className="font-semibold">Ayurvedic Advice</AlertTitle>
                            <AlertDescription>{result.advice}</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
            {!isLoading && !result && (
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg h-full flex flex-col justify-center">
                    <p>Your dietary advice will appear here.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
